import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, cone, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Backing and Docking VR — Mobility & Transit, the fourth of five
// Commercial Class A stations in the Job Readiness Edition's TDL
// pre-apprenticeship block. An alley dock — the 90-degree back into a door
// between two parked trailers — the way the range part of Class A training
// teaches it: the door assignment read, window down and flashers on, a
// get-out-and-look walk of the path, a sight-side set-up at the right angle,
// the wheel turned the way a trailer needs, a dead-slow back with a spotter
// who must stay in the mirror, a second look, the last feet feathered onto the
// bumpers, brakes set, the wheel chocked, the door handed over, and the log
// changed from driving.
//
// The rig is drawn shorter than a real one so it fits the station. Sited
// generically: no real carrier or warehouse, no invented clause number.

const BKD_ACCENT = 0xb88cf0;
const BKD_CAB = 0xe8eef2;
const BKD_TIRE = 0x1a1d21;

export const SIM_TDL_BACKING_AND_DOCKING = {
  id: "tdl-backing-and-docking",
  index: "225",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: backing and docking under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "clear",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A range curriculum includes straight-line, offset and alley-dock backing, delivered by a provider on the Training Provider Registry; 49 CFR 393 for the mirrors and lamps backing depends on; 49 CFR 395 hours of service and the electronic logging device's duty status at the dock; OSHA 29 CFR 1910.178 for the trailer brakes and wheel chocks a warehouse needs before its forklifts board; ANSI/ISEA 107 high-visibility apparel for the spotter; Teamsters (IBT) freight locals' driver training",
  name: "Backing and Docking",
  title: simTitle("Backing and Docking"),
  tagline: "An alley dock between two trailers: the door read, window down and flashers on, get out and look, a sight-side set-up, the wheel turned the trailer's way, dead slow with a spotter in the mirror, look again, feather onto the bumpers, brakes, chock, hand over and change the log",
  accent: BKD_ACCENT,
  accentCss: "#b88cf0",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "sight-side", name: "Sight Side", note: "A sight-side alley dock with two looks, the spotter always in view and the trailer chocked at the door — first time" },

  game: system({
    name: "Backing",
    currency: "FOOT",
    ranks: ["Permit Holder", "Driver Trainee", "Class A Driver", "Yard Lead", "Backing Certified"],
    badges: [
      { id: "got-out", name: "Got Out and Looked", note: "Both walks found everything without a hint", test: AWARD.all(AWARD.stepClean("goal-walk"), AWARD.stepClean("second-look")) },
      { id: "never-blind", name: "Never Blind", note: "Never set up blind-side, put the spotter behind the trailer, picked up the phone or pulled on a red light", test: AWARD.safe },
      { id: "dead-slow", name: "Dead Slow", note: "The back held in band the whole way", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-dock", name: "Clean Dock", note: "No corrections anywhere", test: AWARD.clean },
      { id: "right-angle", name: "Right Angle", note: "Set-up angle read near the centre of the band", test: AWARD.precise(0.7) },
      { id: "on-time", name: "On Time", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bkd-blind-side": "You went to set up for a blind-side back when the door could be taken from the sight side. Backing toward the passenger side leaves the trailer's rear corner in a mirror you can barely use; backing toward the driver's side lets you see the trailer through your own window. Sight side whenever the yard allows it.",
    "bkd-spotter-behind": "You went to put the spotter directly behind the trailer, between it and the dock. That is the one place a spotter must never stand: if the trailer moves further than you think, they are pinned against the bumpers. A spotter stands off the rear corner on the sight side, where you can see them and they can see the gap.",
    "bkd-phone": "You went to pick up the phone while backing. Hand-held phone use while driving a commercial vehicle is prohibited by FMCSA, and backing is the moment you need both hands, both mirrors and your spotter's signals. The call waits until the brakes are set.",
    "bkd-pull-red": "You went to pull away from the door with the dock light showing red. Red means the dock is working the trailer — a forklift may be inside it right now. You move only when the light is green and the dock has released you.",
  },

  lateNotes: {
    "bkd-steering": "The wheel is turned for the back once the set-up angle is right — steering before the set-up just makes the angle worse.",
    "bkd-wheel-chock": "The chock goes in once the trailer is on the bumpers and the brakes are set — never while the rig can still move.",
    "bkd-eld-status": "The log is changed once the trailer is handed over, so the time on the dock is logged as what it is.",
  },

  steps: [
    {
      id: "assignment", kind: "select", target: "bkd-dock-assignment",
      title: "Read the door assignment",
      cue: "Read the door number, what is parked either side, and the receiver's rules for chocks and keys.",
      why: "An alley dock is planned before the truck moves: which door, what is parked either side of it, where the yard gives you room to swing, and what the receiver expects once you are in — chocks, keys to the office, a light system. Reading it first is what lets you choose a sight-side set-up and know where your spotter should stand, instead of improvising halfway into the back.",
    },
    {
      id: "prep", kind: "sequence",
      targets: ["bkd-window", "bkd-flashers", "bkd-horn"],
      itemNames: { "bkd-window": "window down", "bkd-flashers": "four-way flashers on", "bkd-horn": "tap the horn" },
      title: "Window down, flashers on, horn",
      cue: "Wind the window down so you can hear the spotter, put the four-ways on, and tap the horn before you move.",
      why: "Backing is done with every sense you have: the window down lets you hear the spotter and anyone shouting, the four-ways and the reverse alarm tell everyone in the yard the rig is about to move backwards, and a tap of the horn is the last warning before it does. None of it costs time, and all of it is for the person you have not seen yet.",
      outOfOrderNote: "Window, flashers, then the horn — you want to hear the answer to the horn before you move.",
    },
    {
      id: "goal-walk", kind: "find", noHint: true,
      targets: ["bkd-pothole", "bkd-pallet-debris", "bkd-low-canopy"],
      itemNames: { "bkd-pothole": "the pothole in the swing path", "bkd-pallet-debris": "the broken pallet in the door lane", "bkd-low-canopy": "the low canopy edge over the next door" },
      itemNotes: {
        "bkd-pothole": "A deep pothole right where the trailer tandem will track in the swing. A tire dropped into it jolts the trailer and can snap a landing-gear foot on a dropped trailer.",
        "bkd-pallet-debris": "A broken pallet lying in the door lane. Backed over, it spears a tire or jams under the trailer; it is moved before the back, not after.",
        "bkd-low-canopy": "The canopy edge over the next door hangs lower than the trailer roof. A trailer swung too wide catches it — a torn roof and a canopy on the ground.",
      },
      title: "Get out and look",
      cue: "Get out and walk the path the trailer will take. Find what it will hit or drop into.",
      why: "GOAL — get out and look — is the most reliable backing tool a driver has, because mirrors show only strips of the world and nothing directly behind the trailer. Walking the path before the back finds the potholes, debris, low overheads and parked cars that no mirror will show until you are already in them, and it is what range training drills from the first day.",
    },
    {
      id: "setup", kind: "gauge", target: "bkd-setup-angle",
      title: "Set up at the right angle, sight side",
      cue: "Pull forward past the door so the trailer sits at the set-up angle on the sight side, then commit.",
      why: "A good alley dock is decided before the first foot of reverse: pulled far enough past the door and angled so the trailer's rear already points toward it, on the driver's side so you can see it through your window. Too shallow and you run out of room; too sharp and the trailer jackknifes into the tractor. Getting the set-up right is most of the back.",
      gauge: { label: "SET-UP ANGLE", speed: 0.7, green: [0.4, 0.62], readout: (t) => `${Math.round(10 + t * 60)}°`, missNote: "That angle will not make the door — pull up and set up again rather than fighting it in reverse." },
    },
    {
      id: "steer", kind: "turn", target: "bkd-steering",
      title: "Turn the wheel the trailer's way",
      cue: "Hand at the bottom of the wheel: move it toward the side you want the trailer's rear to go.",
      why: "In reverse a trailer goes the opposite way from the steering wheel, which is why range training teaches the hand at the bottom of the wheel: move your hand the way you want the trailer to go. Small, early corrections work; big late ones swing the trailer past the line and start a jackknife. When the correction stops working, you pull up and start again.",
      turn: { turns: 0.75, axis: "z", label: "STEERING" },
    },
    {
      id: "back", kind: "track", target: "bkd-throttle", seconds: 8,
      title: "Back dead slow with the spotter in the mirror",
      cue: "Back at idle speed, watching both mirrors and your spotter's signals, and correct early.",
      why: "Idle speed in the lowest reverse gear is the speed at which you can stop within a few inches, and backing is all about stopping in time. Your eyes go mirror to mirror to spotter, never to one of them for long. The rule with a spotter is absolute: if you cannot see them, you stop, because a spotter you cannot see may be exactly where the trailer is going.",
      track: { start: 0.1, green: [0.32, 0.52], rise: 0.52, fall: 0.46, drift: 0.12, label: "REVERSE", readout: (v) => (v < 0.32 ? "stalled" : v > 0.52 ? "too fast" : "idle speed") },
      holdBreakNote: "Speed out of band — back at idle, or you cannot stop in time when the spotter signals.",
    },
    {
      id: "second-look", kind: "find", noHint: true,
      targets: ["bkd-trailer-gap", "bkd-dock-light-red"],
      itemNames: { "bkd-trailer-gap": "your rear corner a hand's width from the parked trailer", "bkd-dock-light-red": "the outside dock light still red" },
      itemNotes: {
        "bkd-trailer-gap": "Your trailer's rear corner is closing on the parked trailer beside the door. Pull up and straighten now; another foot and the two trailers meet.",
        "bkd-dock-light-red": "The outside light at this door is red. The door is not ready — the leveler or the restraint is not set for you — and you wait for green before you finish the back.",
      },
      title: "Get out and look again",
      cue: "Halfway in, stop, get out and look. Find what has changed.",
      why: "A second look halfway through the back catches what the first could not: how the trailer is actually tracking, how close the corners are to the trailers either side, and whether the door is ready for you. Drivers who stop and look twice hit fewer things, and a second look costs a minute where a scraped trailer costs a claim and a report.",
    },
    {
      id: "feather", kind: "hold", target: "bkd-brake-pedal", seconds: 8,
      title: "Feather the last feet onto the bumpers",
      cue: "Cover the brake and feather it for the last few feet, so the trailer touches the bumpers without a hit.",
      why: "The last few feet of a dock are where people and property get hurt: a trailer that hits the dock bumpers hard shoves the building, damages the leveler and can throw anyone standing at the door edge. Feathering the brake lets the trailer settle onto the bumpers square and gentle, and a trailer that lands square is one the restraint can hook.",
      holdBreakNote: "You came off the brake in the last feet. Cover it and feather the trailer onto the bumpers.",
    },
    {
      id: "set-brakes", kind: "select", target: "bkd-set-brakes",
      title: "Set the brakes at the door",
      cue: "Set the parking brakes on the tractor and trailer and put the transmission in neutral.",
      why: "A trailer at a dock is about to be driven onto by forklifts, and every pass pushes it away from the building. Parking brakes on both the tractor and the trailer are the first thing holding it there; OSHA expects the trailer's brakes to be set and its wheels chocked before a powered truck boards it, and the driver is the one who sets them.",
    },
    {
      id: "chock", kind: "drag", target: "bkd-wheel-chock",
      title: "Chock the trailer wheel",
      cue: "Get down facing the cab with three points of contact, and set the chock at the trailer's rear tandem.",
      why: "Brakes hold a trailer; a chock stops it creeping when brakes leak off or forklifts shove it. Many receivers require the driver to chock before the door opens, and it takes seconds. The trailer that walks away from a dock with a forklift halfway across the plate is the accident the chock exists to prevent.",
      drag: { to: "bkd-chock-socket", radius: 0.45, missNote: "Not against the tire — set the chock snug to the trailer's rear tandem." },
    },
    {
      id: "handoff", kind: "sequence",
      targets: ["bkd-restraint-check", "bkd-keys-office"],
      itemNames: { "bkd-restraint-check": "restraint hooked, light red outside", "bkd-keys-office": "keys to the dock office" },
      title: "Hand the door over",
      cue: "Check the restraint has hooked and the outside light is red, then take your keys to the dock office.",
      why: "The handover is what stops the trailer leaving while it is being worked. The restraint hooked and the light red tell you the dock has it; your keys at the office mean the tractor cannot be driven away with a forklift in the trailer, by you or anyone else. It is the driver's half of the same system the loader relies on inside.",
      outOfOrderNote: "Restraint and light first, then the keys — the dock has to have the trailer before you give up the tractor.",
    },
    {
      id: "crew-checkin", kind: "select", target: "bkd-crew-checkin",
      title: "Debrief with the spotter",
      cue: "Talk the back through with the spotter: where they lost sight of you, what the second look caught, and how it felt.",
      why: "A thirty-second debrief with the spotter is how both of you get better at the next door: the moment they stepped out of the mirror, the corner that closed faster than you expected, the signal that was not clear. It is also a check-in with yourself — backing under pressure at a busy dock is stressful, and saying so is part of doing it safely day after day.",
    },
    {
      id: "eld-status", kind: "select", target: "bkd-eld-status",
      title: "Change your duty status in the log",
      cue: "Change the electronic log from driving to on duty, not driving, and note the door and the time.",
      why: "Under 49 CFR 395 time spent at a dock waiting, supervising or being loaded is on-duty time, not driving and not off duty, and the electronic logging device records it as whatever status you give it. Logging it accurately is what keeps your eleven- and fourteen-hour limits true, and a log that shows driving while the truck sat at a door is a log that fails an inspection.",
    },
  ],

  interrupts: [
    {
      id: "spotter-out-of-view",
      kind: "Spotter lost",
      after: "back", delay: 3, seconds: 10,
      alert: "Your spotter has stepped out of the mirror, round behind the trailer, and you can no longer see them or their signals.",
      cue: "Stop the truck.",
      target: "bkd-brake-pedal",
      why: "The rule with a spotter has no exceptions: lose sight of them and you stop. A spotter out of view may have gone round the trailer to look at something, stepped into the gap to wave you back, or fallen — and in every case the next foot of reverse is toward them.",
      missNote: "You kept backing without your spotter in view. Spotters are struck and pinned by the trucks they are guiding precisely when they step out of the driver's sight to get a better look.",
      wrongNote: "It is the brake. You have lost sight of the person guiding you, and the rig stops until you see them again.",
    },
    {
      id: "dock-worker-at-edge",
      kind: "Person at the dock edge",
      after: "feather", delay: 3, seconds: 10,
      alert: "The dock door has rolled up and a dock worker has stepped onto the leveler lip, looking into the gap as your trailer closes the last feet.",
      cue: "Warn them before the trailer arrives.",
      target: "bkd-horn",
      why: "A person standing on the leveler lip is between a closing trailer and the building. The horn gets their attention and gets them back from the edge; the trailer does not touch the bumpers until they are clear.",
      missNote: "You closed on the dock with someone on the leveler lip. A trailer landing on the bumpers can throw a person off the lip into the gap or pin their feet against the plate.",
      wrongNote: "It is the horn. Somebody is standing on the edge your trailer is about to land against.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, BKD_ACCENT);

    // ------------------------------------------------------------ yard apron
    const yardTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#403f3c", base2: "#373633", seam: "rgba(0,0,0,0.45)" }), { repeat: 5, px: 512 });
    const yard = box(g, 12, 0.12, 9, 0.5, 0.06, 0, 0xffffff, { rough: 0.95 });
    yard.material = texturedMat(yardTex, { rough: 0.95, metal: 0.02, color: 0xadaaa6 });
    for (const x of [-3.2, -1.2, 1.2, 3.2]) box(g, 0.1, 0.006, 3.0, x, 0.123, -1.9, 0xf2c14b, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ the building face with three doors
    const bldg = group(g, 0, 0.12, -3.6);
    box(bldg, 10.6, 4.2, 0.4, 0, 2.1, -0.2, 0xb3bcc3, { rough: 0.7 });
    box(bldg, 10.6, 1.2, 0.2, 0, 0.6, 0.1, 0x6e757b, { rough: 0.8 });
    const doors = [];
    for (const [i, x] of [[0, -3.4], [1, 0], [2, 3.4]]) {
      const d = box(bldg, 1.9, 2.6, 0.05, x, 2.5, 0.02, i === 1 ? 0x2b2f34 : 0x8b959c, { rough: 0.6, metal: 0.4 });
      doors.push(d);
      for (const sx of [-1, 1]) box(bldg, 0.3, 0.32, 0.14, x + sx * 0.8, 1.05, 0.2, 0x1b1e23, { rough: 0.9 });
      decal(bldg, 0.3, 0.16, x, 4.0, 0.02, signFace(String(11 + i), { bg: "#2b2f34", accent: "#b88cf0", scale: 0.6 }), { px: 96 });
    }
    const redLight = cyl(bldg, 0.07, 0.07, 0.04, -1.2, 2.2, 0.05, 0xd2312b, { emissive: 0xd2312b, ei: 1.3, rough: 0.4, seg: 14 });
    redLight.rotation.x = Math.PI / 2;
    reg2(redLight, "bkd-dock-light-red");
    const greenLight = cyl(bldg, 0.07, 0.07, 0.04, -1.2, 2.0, 0.05, 0x1a4a2a, { rough: 0.4, seg: 14 });
    greenLight.rotation.x = Math.PI / 2;
    const restraint = box(bldg, 0.3, 0.16, 0.2, 0, 0.35, 0.25, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    reg2(restraint, "bkd-restraint-check");
    const canopy = box(bldg, 2.4, 0.12, 1.2, 3.4, 3.7, 0.6, 0x59636d, { rough: 0.6, metal: 0.4 });
    reg2(canopy, "bkd-low-canopy");
    const office = group(bldg, 1.6, 0, 0.3);
    box(office, 0.9, 2.1, 0.06, 0, 1.05, 0, 0x2f5f9e, { rough: 0.5 });
    decal(office, 0.5, 0.16, 0, 2.3, 0.04, signFace("DOCK OFFICE", { bg: "#2f5f9e", accent: "#ffffff", scale: 0.4 }), { px: 128 });
    const keyBox = box(office, 0.2, 0.2, 0.08, 0.3, 1.3, 0.06, 0x2b2f34, { rough: 0.5 });
    reg2(keyBox, "bkd-keys-office");
    const dockWorker = standingFigure(g, 0.9, -4.3, { ry: 0.2, cloth: 0x37505f, vest: 0xd8e24a });

    // ------------------------------------------------------------ parked trailers at doors 11 and 13
    const van = (x, z, ry, tone) => {
      const v = group(g, x, 0.12, z, ry);
      box(v, 2.55, 2.6, 4.2, 0, 2.55, 0, tone, { rough: 0.6, metal: 0.2 });
      box(v, 2.3, 0.12, 4.2, 0, 1.2, 0, 0x59636d, { rough: 0.6, metal: 0.4 });
      for (const sx of [-1, 1]) for (const dz of [-1.2, -0.6]) cyl(v, 0.48, 0.48, 0.3, sx * 1.0, 0.48, dz, BKD_TIRE, { rough: 0.9, seg: 16 }).rotation.z = Math.PI / 2;
      return v;
    };
    van(-3.4, -0.9, 0, 0xdfe4e8);
    const right = van(3.4, -0.9, 0, 0xe8e2d4);
    const gapCorner = box(right, 0.3, 0.8, 0.3, -1.35, 1.5, -1.9, 0xd2312b, { opacity: 0.3, cast: false });
    reg2(gapCorner, "bkd-trailer-gap");

    // ------------------------------------------------------------ your rig, set up at an angle, trailer rear to door 12
    const RIG_START = { x: 1.3, z: 0.3, ry: 0.55 };
    const rig = group(g, RIG_START.x, 0.12, RIG_START.z, RIG_START.ry);
    const trl = group(rig, 0, 0, 0);
    box(trl, 2.55, 2.6, 4.6, 0, 2.55, 0.9, 0xf2f5f7, { rough: 0.6, metal: 0.2 });
    box(trl, 2.3, 0.12, 4.6, 0, 1.2, 0.9, 0x59636d, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) for (const dz of [-0.7, -0.1]) cyl(trl, 0.48, 0.48, 0.3, sx * 1.0, 0.48, dz, BKD_TIRE, { rough: 0.9, seg: 16 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) box(trl, 0.1, 0.1, 0.06, sx * 1.1, 1.5, -1.41, 0xd2312b, { emissive: 0xd2312b, ei: 0.6, rough: 0.3 });
    decal(trl, 1.6, 0.4, 1.285, 2.7, 0.9, signFace("REGIONAL", { bg: "#f2f5f7", fg: "#2b2140", accent: "#b88cf0", scale: 0.55 }), { px: 256 }).rotation.y = Math.PI / 2;
    const chockSocket = box(trl, 0.3, 0.2, 0.3, 1.0, 0.1, 0.35, 0xffffff, { rough: 0.5 });
    chockSocket.visible = false; hits["bkd-chock-socket"] = chockSocket;
    const trac = group(rig, 0, 0, 3.4);
    box(trac, 2.4, 1.8, 1.4, 0, 2.0, 0.2, BKD_CAB, { rough: 0.4, metal: 0.4 });
    box(trac, 2.2, 0.75, 0.05, 0, 2.45, 0.92, 0x22303a, { rough: 0.15, metal: 0.6 });
    box(trac, 2.0, 0.9, 1.1, 0, 1.45, 1.45, BKD_CAB, { rough: 0.4, metal: 0.4 });
    for (const sx of [-1, 1]) { cyl(trac, 0.5, 0.5, 0.32, sx * 1.1, 0.5, 1.5, BKD_TIRE, { rough: 0.9, seg: 18 }).rotation.z = Math.PI / 2; cyl(trac, 0.5, 0.5, 0.55, sx * 1.05, 0.5, -0.4, BKD_TIRE, { rough: 0.9, seg: 18 }).rotation.z = Math.PI / 2; }
    for (const sx of [-1, 1]) box(trac, 0.2, 0.5, 0.06, sx * 1.4, 2.4, 1.0, 0x2b2f34, { rough: 0.4, metal: 0.4 });
    cyl(trac, 0.08, 0.08, 1.8, -1.15, 2.6, -0.1, 0xc9ced2, { rough: 0.3, metal: 0.8, seg: 12 });

    // ------------------------------------------------------------ the path: GOAL finds and hazard markers
    const pothole = cyl(g, 0.35, 0.35, 0.02, -0.6, 0.125, -0.4, 0x1b1a18, { rough: 1, seg: 16 });
    reg2(pothole, "bkd-pothole");
    const debris = group(g, 0.3, 0.12, -2.0, 0.4);
    box(debris, 0.9, 0.08, 0.5, 0, 0.04, 0, 0x8a6c4a, { rough: 0.95 });
    const plank = box(debris, 0.8, 0.03, 0.1, 0.1, 0.1, 0.1, 0x6a5238, { rough: 0.95 });
    plank.rotation.z = 0.3;
    reg2(debris, "bkd-pallet-debris");
    const blind = slab(g, 1.1, 0.02, 0.8, -3.3, 0.13, 3.3, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "set up blind-side instead?", -3.3, 0.34, 3.3, { css: "#d2312b", w: 0.44 });
    reg2(blind, "bkd-blind-side");
    const behind = slab(g, 1.0, 0.02, 0.5, 0.1, 0.13, -2.9, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "spotter stands here?", 0.1, 0.34, -2.75, { css: "#d2312b", w: 0.36 });
    reg2(behind, "bkd-spotter-behind");
    const pullRed = slab(g, 1.0, 0.02, 0.5, -0.5, 0.13, 3.0, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "pull away on red?", -0.5, 0.34, 3.0, { css: "#d2312b", w: 0.32 });
    reg2(pullRed, "bkd-pull-red");
    const setupGauge = instrument(g, -2.6, 1.2, 1.9, { idle: "ANGLE", color: BKD_ACCENT, w: 0.14, d: 0.16, ry: 0.6 });
    reg2(setupGauge, "bkd-setup-angle");
    holoTag(g, "set-up angle", -2.6, 1.42, 1.9, { css: "#b88cf0", w: 0.24 });

    // ------------------------------------------------------------ the cab controls, brought to the pad
    const dash = group(g, -1.9, 0.12, 2.6, 0.35);
    box(dash, 1.0, 0.9, 0.35, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 0.96, 0.35, 0.05, 0, 1.05, 0.05, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const steering = group(dash, -0.1, 1.25, 0.28);
    const rim = cyl(steering, 0.2, 0.2, 0.03, 0, 0, 0, 0x1b1e23, { rough: 0.5, seg: 18 });
    rim.rotation.x = 1.1;
    box(steering, 0.36, 0.03, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5 });
    reg2(steering, "bkd-steering");
    const hornPad = box(dash, 0.08, 0.05, 0.05, 0.22, 1.2, 0.12, 0x2b2f34, { rough: 0.6 });
    reg2(hornPad, "bkd-horn");
    const flashers = box(dash, 0.06, 0.04, 0.04, 0.08, 1.12, 0.1, 0xd2312b, { rough: 0.5 });
    reg2(flashers, "bkd-flashers");
    const windowSw = box(dash, 0.06, 0.04, 0.04, 0.34, 1.12, 0.1, 0x59636d, { rough: 0.5 });
    reg2(windowSw, "bkd-window");
    const valves = box(dash, 0.14, 0.08, 0.08, 0.34, 0.95, 0.12, 0xf2c14b, { rough: 0.5 });
    reg2(valves, "bkd-set-brakes");
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.05, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "bkd-brake-pedal");
    const throttle = box(dash, 0.08, 0.03, 0.18, 0.22, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(throttle, "bkd-throttle");
    const eld = instrument(dash, -0.36, 1.08, 0.09, { idle: "DRIVING", color: BKD_ACCENT, w: 0.16, d: 0.12 });
    reg2(eld, "bkd-eld-status");
    const phone = box(dash, 0.07, 0.12, 0.01, 0.44, 1.2, 0.12, 0x1b1e23, { rough: 0.3 });
    holoTag(dash, "phone ringing — answer?", 0.44, 1.42, 0.12, { css: "#d2312b", w: 0.4 });
    reg2(phone, "bkd-phone");
    holoTag(dash, "cab: wheel · horn · brake · log", 0, 1.62, 0.1, { css: "#b88cf0", w: 0.52 });

    // ------------------------------------------------------------ chock, boards, spotter
    const chock = box(g, 0.28, 0.2, 0.26, 0.4, 0.22, 3.0, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "wheel chock", 0.4, 0.55, 3.0, { css: "#b88cf0", w: 0.22 });
    reg2(chock, "bkd-wheel-chock");
    const assign = holoPanel(g, 0.8, 0.52, -3.7, 1.55, 2.1, (ctx, w, h) => {
      ctx.fillStyle = "#100a1a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b88cf0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ece0fb"; ctx.fillText("DOOR 12 — LIVE UNLOAD", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f6f0fd";
      ["Trailers parked at 11 and 13", "Swing room: sight side, from the east", "Spotter on the driver's-side corner", "Wait for green at the door", "Chock the trailer, keys to the office", "Log on duty at the door"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.9, accent: BKD_ACCENT });
    reg2(assign, "bkd-dock-assignment");
    const checkin = holoPanel(g, 0.46, 0.3, 0.6, 1.75, 3.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SPOTTER DEBRIEF", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Lost sight · corners · how it felt", w / 2, h * 0.66);
    }, { ry: -0.6, accent: 0x4fd1ff });
    reg2(checkin, "bkd-crew-checkin");
    cone(g, 4.6, -1.2);
    cone(g, -4.4, 2.8);
    const spotter = standingFigure(g, -1.55, -1.8, { ry: 0.6, cloth: 0x2b3138, vest: 0xd8e24a });
    holoTag(spotter, "spotter", 0, 1.95, 0, { css: "#b88cf0", w: 0.16 });

    let backed = 0;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.6, 1.2, -1.8),
      onStepComplete(step) {
        if (step.id === "goal-walk") debris.position.set(4.6, 0.12, -2.6);
        if (step.id === "setup") repaint(setupGauge.userData.screen, signFace("SET", { bg: "#100a1a", accent: "#59c97b", fg: "#f6f0fd", scale: 0.55 }));
        if (step.id === "second-look") { redLight.material = mat(0x5a1a1a, { rough: 0.4 }); greenLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.3, rough: 0.4 }); }
        if (step.id === "feather") { rig.rotation.y = 0; rig.position.set(0, 0.12, -1.8); doors[1].visible = false; }
        if (step.id === "chock") { chock.parent.remove(chock); trl.add(chock); chock.position.set(1.0, 0.1, 0.35); }
        if (step.id === "handoff") { greenLight.material = mat(0x1a4a2a, { rough: 0.4 }); redLight.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.3, rough: 0.4 }); restraint.position.y = 0.6; }
        if (step.id === "eld-status") repaint(eld.userData.screen, signFace("ON DUTY", { bg: "#100a1a", accent: "#59c97b", fg: "#f6f0fd", scale: 0.45 }));
      },
      // The spotter really walks behind the trailer out of the mirror; the dock
      // worker really steps out onto the leveler lip.
      onInterrupt(it) {
        if (it.id === "spotter-out-of-view") { spotter.position.set(0.9, 0, -2.6); spotter.rotation.y = 0; }
        if (it.id === "dock-worker-at-edge") { doors[1].visible = false; dockWorker.position.set(0.3, 0.12, -3.3); dockWorker.rotation.y = 0.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "spotter-out-of-view") { spotter.position.set(-1.55, 0, -1.8); spotter.rotation.y = 0.6; }
        if (it.id === "dock-worker-at-edge") { dockWorker.position.set(0.9, 0, -4.3); hornPad.material = mat(0x59c97b, { rough: 0.6 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "setup") {
          const ok = gg.t >= 0.4 && gg.t <= 0.62;
          repaint(setupGauge.userData.screen, signFace(`${Math.round(10 + gg.t * 60)}°`, { bg: "#100a1a", accent: ok ? "#59c97b" : "#f2ae14", fg: "#f6f0fd", scale: 0.55 }));
        }
        if (session?.turn && step?.id === "steer") steering.rotation.z = session.turn.amount * Math.PI * 2;
        if (step?.id === "back" && session.holding) {
          backed = Math.min(1, backed + dt / 8);
          rig.rotation.y = RIG_START.ry * (1 - backed * 0.6);
          rig.position.set(RIG_START.x - backed * 0.6, 0.12, RIG_START.z - backed * 1.2);
        }
        void t;
      },
    };
  },
};
