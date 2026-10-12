import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { coldRoomDoor, palletRackBay, palletStack } from "../../../shared/props.js";
import { forkliftCounterbalance } from "../../../shared/fleet.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cold-Storage PPE & Rotation VR — Manufacturing & Automation,
// Teamsters warehouse and logistics automation.
//
// A cold-storage room does not announce the ways it can hurt somebody the
// way a machine does — no moving part, no obvious pinch point, just cold
// enough, long enough, on a floor that is never quite as dry as it looks.
// This station walks the room's own entry sequence: the insulated PPE worn
// before the door ever opens, a buddy actually checked in rather than
// assumed nearby, the ice and the propped door and the torn seal all
// caught before they cause a fall or a temperature excursion, the correct
// rotation-marked pallet pulled by date rather than by convenience, and
// the buddy checked out again before the associate moves on to the next
// task. No cold room's actual temperature, exposure time limit or PPE
// rating is a number this platform is certain of — those live on the room's
// own posted procedure and the site's cold-work programme.

const TW7_PAL = palette("warehouse");
const TWCS_ACCENT = 0x4fb8c9;

export const SIM_TW_COLD_STORAGE_PPE_AND_ROTATION = {
  id: "tw-cold-storage-ppe-and-rotation",
  index: "tw-7",
  domain: "Warehousing & Logistics",
  trade: "Teamsters warehouse associate — cold-storage entry and stock rotation",
  category: "Manufacturing & Automation",
  indoor: "clinic",
  certification: "Teamsters warehouse and logistics automation training; ASHRAE 15 safety standard for refrigeration systems and IIAR 2 and IIAR 6 for closed-circuit ammonia refrigeration design, inspection and maintenance, worked the way the site's own cold-work programme applies them; OSHA 29 CFR 1910.132 personal protective equipment for insulated cold-work gear; NIOSH findings on cold-storage slip and cold-stress incidents",
  name: "Cold-Storage PPE & Rotation",
  title: simTitle("Cold-Storage PPE & Rotation"),
  tagline: "Entering a cold-storage room the way its own procedure requires it: insulated PPE worn before the door opens, a buddy actually checked in, the ice and the propped door and the torn seal caught before they become a fall or a temperature excursion, and the correct rotation-marked pallet pulled by date rather than by convenience",
  accent: TWCS_ACCENT,
  accentCss: "#4fb8c9",
  parSeconds: 270,
  footprint: 2.7,
  badge: { id: "cold-storage-certified", name: "Cold-Storage Certified", note: "Checked in with a buddy, caught every hazard on the room read, pulled the correct rotation-marked pallet, and checked out again before moving on" },

  game: system({
    name: "Cold-Room Discipline",
    currency: "FROST",
    ranks: ["Room Visitor", "Cold Aware", "Cold-Storage Handler", "Cold-Storage Authority", "Cold-Storage Certified"],
    badges: [
      { id: "buddy-every-time", name: "Buddy Every Time", note: "Checked in and out with a buddy, first try", test: AWARD.stepClean("buddy-checkin") },
      { id: "never-skip-the-ice", name: "Never Skip the Ice", note: "Never missed a hazard on the room read", test: AWARD.stepClean("room-hazard-read") },
      { id: "fifo-honest", name: "FIFO Honest", note: "Pulled the correctly rotation-marked pallet, first try", test: AWARD.stepClean("rotation-confirm") },
      { id: "clean-checkout", name: "Clean Checkout", note: "Logged out clean, no corrections", test: AWARD.clean },
    ],
    challenges: [
      { id: "quick-pull", name: "Quick Pull", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "frost-streak", name: "Frost Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your Teamsters local's member assistance programme, or the site's employee assistance line if a close call in the cold room is what stayed with you",

  hazards: {
    "ice-patch-hazard": "That ice patch has built up right at the doorway threshold, exactly where the temperature swings most on every entry and exit. Ice at a threshold is not a surprise anywhere it forms — it is a slip waiting on whoever assumes the floor is as dry as the aisle behind them.",
    "door-propped-hazard": "That door is propped open with a pallet. A cold room held open is a cold room that is not actually cold any more, and it is also a room whose self-closing door — the one thing that limits how long anyone is exposed on a quick errand — has been disabled by the same prop.",
    "torn-seal-hazard": "That strip curtain has a torn panel hanging loose. A gap in the curtain is a steady stream of warm, humid air finding its way in, and everything that air is carrying condenses and freezes on the first cold surface it reaches — usually the floor, right where somebody is about to walk.",
    "skip-buddy-hazard": "That sign reads 'enter alone' taped over the buddy-system reminder. A buddy system exists for exactly the scenario it looks least necessary in — a quick, familiar errand into a room where nothing has ever gone wrong before is precisely when nobody thinks to miss an associate who does not come back out on time.",
  },

  lateNotes: {
    "buddy-board": "The buddy check-in happens before the door opens, not reconstructed afterward from who happened to notice the associate was gone.",
    "rotation-tag": "The rotation-marked pallet gets confirmed by its tag before it is pulled, not chosen because it happens to be the closest one to the door.",
  },

  interrupts: [
    {
      id: "door-seal-fault",
      kind: "Temperature alarm",
      after: "temp-check", delay: 4, seconds: 12,
      alert: "A temperature alarm sounds — the room ran warmer than it should have during an earlier cycle, a sign the door did not seal properly last time.",
      cue: "Report the alarm to the refrigeration technician rather than continuing the pull as if the room is reading normally.",
      target: "refrigeration-tech-radio",
      why: "A temperature excursion that already happened once and is only now showing up on the alarm is telling you the door seal or the closer needs attention before the next several openings make it worse — reporting it is what gets it fixed instead of quietly tolerated shift after shift.",
      missNote: "The alarm was left unreported. A door that has already failed to seal once will fail again, and each time is a longer temperature excursion than the last.",
      wrongNote: "Not that — a temperature alarm goes to the refrigeration technician before this pull continues.",
    },
    {
      id: "buddy-no-response-fault",
      kind: "Buddy check-in silence",
      after: "rotation-confirm", delay: 4, seconds: 12,
      alert: "The buddy check-in radio call has gone unanswered.",
      cue: "Exit the cold room and account for your buddy in person rather than continuing to work alone past the check-in.",
      target: "supervisor-radio",
      why: "A buddy system only works if a missed check-in actually changes what happens next — continuing to work because the room feels fine treats the one signal built to catch a problem as background noise, exactly when it might be doing its job.",
      missNote: "The missed check-in was ignored and work continued. A buddy system that gets overridden by feeling fine is not a buddy system any more.",
      wrongNote: "Not that — a missed check-in means exiting and accounting for the buddy in person, not continuing to work.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["insulated-coat", "insulated-gloves"],
      itemNames: { "insulated-coat": "insulated coat", "insulated-gloves": "insulated gloves" },
      title: "Suit up before opening the door",
      cue: "Insulated coat and insulated gloves before opening the cold-room door.",
      why: "Putting the insulated gear on before the door opens, rather than partway into the room, is what keeps the first minute inside from being the coldest minute an associate spends unprotected today — the minute a bare hand on a frozen rail or a chilled lung actually notices the difference.",
    },
    {
      id: "buddy-checkin", kind: "select", target: "buddy-board",
      title: "Check in with your buddy",
      cue: "Check in on the buddy board before opening the door.",
      why: "The buddy board is what turns 'someone will notice eventually' into 'someone is actually watching the clock' — checking in is what makes the buddy system real instead of a rule nobody actually follows on a quick errand that everyone assumes will only take a minute.",
    },
    {
      id: "room-hazard-read", kind: "find", noHint: true,
      targets: ["ice-patch-hazard", "door-propped-hazard", "torn-seal-hazard"],
      itemNames: {
        "ice-patch-hazard": "ice patch at the threshold",
        "door-propped-hazard": "door propped open with a pallet",
        "torn-seal-hazard": "torn strip curtain panel",
      },
      itemNotes: {
        "ice-patch-hazard": "The ice gets salted or scraped before anyone crosses this threshold again.",
        "door-propped-hazard": "The prop comes out and the door gets its self-closing function back before the next entry.",
        "torn-seal-hazard": "A torn curtain panel gets replaced, not worked around — the gap keeps growing until it is.",
      },
      decoyNotes: {
        "intact-rack-frame": "That rack frame is intact and properly anchored. Nothing to flag there.",
      },
      title: "Read the room for what is already wrong with it",
      cue: "Look the entry over before opening the door. Three things are already wrong with it — find them.",
      why: "A doorway that looks routine on approach is not the same thing as one an associate has actually checked — ice, a propped door or a torn curtain each quietly turns a controlled cold room into a set of problems that only get bigger with every entry, and finding them now costs a work order instead of costing someone a fall or a spoiled pallet.",
    },
    {
      id: "door-open", kind: "turn", target: "coldroom-door",
      title: "Open the cold-room door",
      cue: "Turn the door handle and open it fully before stepping through.",
      why: "Opening the door fully, rather than squeezing through a gap to save a few seconds of cold air, is what keeps the strip curtain doing its job instead of getting shouldered aside and torn — the same tear this station just found somewhere else on the door.",
      turn: { turns: 0.4, axis: "y", label: "DOOR HANDLE" },
    },
    {
      id: "door-hold-open", kind: "hold", target: "door-assist-button", seconds: 5,
      title: "Hold the door's power assist",
      cue: "Hold the power-assist button until the door has fully retracted for the pallet jack to pass.",
      why: "Holding the assist button for the full retraction, rather than letting go early and forcing the door the rest of the way by hand, is what keeps the door track from taking the kind of side-load that eventually throws it out of alignment.",
      holdBreakNote: "Released the assist button before the door fully retracted. A door forced the last part of the way by hand is a door that will need the track adjusted sooner than it should.",
    },
    {
      id: "rotation-confirm", kind: "select", target: "rotation-tag",
      title: "Confirm the rotation-marked pallet",
      cue: "Confirm the pallet's rotation tag before pulling it.",
      why: "Confirming the tag rather than the position is what keeps first-in-first-out honest — the pallet nearest the door is not always the one that has been here longest, and pulling by convenience instead of by date is how older stock quietly ages past its window.",
    },
    {
      id: "pull-pallet", kind: "drag", target: "marked-pallet",
      title: "Pull the marked pallet",
      cue: "Carry the marked pallet to the door for the waiting forklift.",
      why: "Moving the pallet under control, the short distance to the door where the forklift is actually waiting, is what keeps this errand as brief and as controlled as a cold-room entry should be — a rushed or unsteady carry is exactly how a slip on a still-thawing floor turns into a dropped pallet.",
      drag: { to: "forklift-fork-socket", radius: 0.45, missNote: "Not onto the fork — the pallet only leaves the room under control when it lands where the forklift can take it, not partway there." },
    },
    {
      id: "temp-check", kind: "gauge", target: "temp-gauge",
      title: "Confirm the room temperature",
      cue: "Read the room's temperature gauge and commit only within the expected operating range.",
      why: "A room reading outside its expected range is telling you something before the alarm ever sounds — the gauge is the honest number, not how cold the room feels after thirty seconds of acclimating to it, and a range this platform is not certain of is one the room's own posted procedure states plainly.",
      gauge: {
        label: "ROOM TEMPERATURE", speed: 0.5, green: [0.35, 0.65],
        readout: (t) => (t < 0.35 ? "colder than expected — report it" : t > 0.65 ? "warmer than expected — report it" : "within expected range"),
        missNote: "Committed outside the expected range. A room reading outside its normal range gets reported, not treated as close enough.",
      },
    },
    {
      id: "log-exit-time", kind: "select", target: "exposure-log",
      title: "Log the exit time",
      cue: "Log the exit time before leaving the room area.",
      why: "The exposure log is what lets the next associate, and the site's own cold-work programme, actually see how long people are spending in this room — a log that never gets updated is a limit nobody can tell whether they are honouring, shift after shift, until a pattern of long entries finally shows up somewhere.",
    },
    {
      id: "door-close", kind: "turn", target: "coldroom-door",
      title: "Close the cold-room door",
      cue: "Turn the door handle closed and confirm it seats.",
      why: "A door that is not fully seated will not hold the room's temperature no matter how good the seal is — confirming it now is what keeps this trip from being the reason the next shift finds the room running warm and every pallet on the rack a few degrees closer to spoiled.",
      turn: { turns: 0.4, axis: "y", label: "DOOR HANDLE" },
    },
    {
      id: "buddy-checkout", kind: "select", target: "buddy-board",
      title: "Check out with your buddy",
      cue: "Check out on the buddy board once you are clear of the room.",
      why: "Checking out is what closes the loop the check-in opened — a buddy system that only tracks who went in, never who came back out, cannot actually tell the difference between a normal errand and one that went wrong until somebody notices the associate never reappeared.",
    },
    {
      id: "closing-log", kind: "select", target: "closing-log",
      title: "Sign the pull log",
      cue: "Sign the pull log before moving on to the next task.",
      why: "The signed log is the record that this specific pallet, pulled on this specific rotation tag, actually followed the room's own procedure — not assumed fine because it usually does, and not reconstructed from memory once the pallet is already three aisles away on a forklift.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, TWCS_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.6, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.82 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#b9c4c9", base2: "#aeb9bf", seam: "rgba(0,0,0,0.15)" }), { repeat: 6, px: 512 }),
      { rough: 0.82, metal: 0.05, color: 0xb9c4c9 },
    );

    // ------------------------------------------------------------------ cold room
    const door = coldRoomDoor(g, 0, 0.14, -2.3, { ry: 0 });
    holoTag(door, "cold room 2", 0, 3.0, 0, { css: "#4fb8c9", w: 0.32 });
    const { door: doorLeaf } = door.userData.parts;
    reg(hits, doorLeaf, "coldroom-door");

    const rack = palletRackBay(g, 0, 0.14, -3.6, { ry: 0 });
    holoTag(rack, "cold storage rack", 0, 4.4, 0, { css: "#4fb8c9", w: 0.34 });
    const intactRackFrame = group(rack, 1.2, 2.0, 0.53);
    box(intactRackFrame, 0.08, 0.4, 0.04, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    reg(hits, intactRackFrame, "intact-rack-frame");

    const markedPallet = group(g, -0.6, 0.4, -1.8);
    box(markedPallet, 0.32, 0.28, 0.24, 0, 0, 0, 0xd8d9d4, { rough: 0.7, finish: "brushed" });
    reg(hits, markedPallet, "marked-pallet");
    const rotationTag = group(markedPallet, 0.14, 0.1, 0.13);
    decal(rotationTag, 0.06, 0.05, 0, 0, 0.006, signFace("FIFO", { bg: "#0f1b14", accent: "#59c97b", scale: 0.55 }));
    reg(hits, rotationTag, "rotation-tag");

    const assistButton = group(door, 0.955, 1.3, 0.15);
    ball(assistButton, 0.03, 0, 0, 0, 0x59c97b, { emissive: 0x2f7d4a, ei: 1.1, rough: 0.4, seg: 10, seg2: 8 });
    reg(hits, assistButton, "door-assist-button");

    // Hazards.
    const icePatch = box(g, 0.5, 0.006, 0.4, 0, 0.145, -1.4, 0xdfeff6, { rough: 0.25, opacity: 0.55, transparent: true, cast: false });
    reg(hits, icePatch, "ice-patch-hazard");
    const propPallet = group(g, 0.9, 0, -1.9);
    box(propPallet, 0.9, 0.14, 1.0, 0, 0.07, 0, 0xc9a86b, { rough: 0.8, finish: "brushed" });
    reg(hits, propPallet, "door-propped-hazard");
    const tornCurtain = group(door, 0.6, 1.1, 0.12);
    box(tornCurtain, 0.15, 0.4, 0.01, 0, 0, 0, 0xd8c98a, { rough: 0.5, opacity: 0.5, transparent: true });
    tornCurtain.rotation.z = 0.3;
    reg(hits, tornCurtain, "torn-seal-hazard");
    const skipSign = box(g, 0.16, 0.1, 0.02, -1.8, 1.0, -2.0, 0xd2312b, { rough: 0.5 });
    decal(skipSign, 0.14, 0.08, 0, 0, 0.011, signFace("ENTER\nALONE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.4 }));
    reg(hits, skipSign, "skip-buddy-hazard");

    const tempGauge = group(g, 1.7, 0, -1.6, -0.4);
    box(tempGauge, 0.14, 0.1, 0.03, 0, 0.9, 0, 0x0d1c24, { rough: 0.5 });
    holoTag(tempGauge, "temperature gauge", 0, 1.0, 0, { css: "#4fb8c9", w: 0.4 });
    reg(hits, tempGauge, "temp-gauge");

    const forklift = forkliftCounterbalance(g, 1.4, 0.14, 0.6, { ry: -2.4, livery: { colour: TWCS_ACCENT, fleetName: "DOCK FLEET", unitNumber: "FL-6" } });
    holoTag(forklift, "forklift FL-6", 0, 2.4, 0, { css: "#4fb8c9", w: 0.3 });
    const forkSocket = group(g, 1.0, 0.14, -0.2);
    hits["forklift-fork-socket"] = forkSocket;

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.8, 0, -1.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const coatProp = box(ppeRack, 0.24, 0.34, 0.05, 0, 0.6, 0, 0xd8d9d4, { rough: 0.7 });
    holoTag(coatProp, "insulated coat", 0, 0.24, 0, { css: "#4fb8c9", w: 0.36 });
    reg(hits, coatProp, "insulated-coat");
    const glovesProp = group(ppeRack, 0.2, 0.62, 0);
    box(glovesProp, 0.14, 0.06, 0.1, 0, 0, 0, 0x8b929a, { rough: 0.75 });
    holoTag(glovesProp, "insulated gloves", 0, 0.16, 0, { css: "#4fb8c9", w: 0.4 });
    reg(hits, glovesProp, "insulated-gloves");

    // ------------------------------------------------------------------ dressing
    const rack2 = palletRackBay(g, -2.8, 0.14, -3.4, { ry: Math.PI / 2 });
    holoTag(rack2, "cold storage rack 2", 0, 4.4, 0, { css: "#4fb8c9", w: 0.36 });
    palletStack(g, 2.5, 0, -3.2, { ry: 0.3 });
    palletStack(g, -0.4, 0, 2.4, { ry: -0.3 });

    // ------------------------------------------------------------------ crew, boards
    const associate = standingFigure(g, -1.8, 2.1, { ry: -2.4, cloth: 0x2b3138, vest: TW7_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(associate, "warehouse associate", 0, 1.95, 0.15, { css: "#4fb8c9", w: 0.36 });

    const buddy = standingFigure(g, 1.55, 2.3, { ry: -2.0, cloth: 0x37505f, vest: TW7_PAL.accent, helmet: 0xf2c14b });
    holoTag(buddy, "buddy", 0, 1.95, 0.15, { css: "#4fb8c9", w: 0.22 });
    const buddyBoard = group(g, 2.2, 0, 1.5, -0.4);
    box(buddyBoard, 0.12, 0.16, 0.02, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    holoTag(buddyBoard, "buddy board", 0, 1.35, 0, { css: "#4fb8c9", w: 0.3 });
    reg(hits, buddyBoard, "buddy-board");
    const supervisorRadio = group(g, 2.4, 0, 1.9, -0.3);
    box(supervisorRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(supervisorRadio, "supervisor radio", 0, 1.35, 0, { css: "#4fb8c9", w: 0.34 });
    reg(hits, supervisorRadio, "supervisor-radio");
    const refrigTechRadio = group(g, -2.2, 0, 1.6, 0.4);
    box(refrigTechRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(refrigTechRadio, "refrigeration tech radio", 0, 1.35, 0, { css: "#4fb8c9", w: 0.4 });
    reg(hits, refrigTechRadio, "refrigeration-tech-radio");

    const exposureLog = group(g, -2.4, 0, 0.9, 0.3);
    box(exposureLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    holoTag(exposureLog, "exposure log", 0, 1.32, 0, { css: "#4fb8c9", w: 0.3 });
    reg(hits, exposureLog, "exposure-log");

    const closingLog = group(g, 2.7, 0, 0.4, 0.5);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("PULL LOG\nOPEN", { bg: "#11181f", accent: "#4fb8c9", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "pull log", 0, 1.32, 0, { css: "#4fb8c9", w: 0.24 });
    reg(hits, closingLog, "closing-log");

    return {
      hits,
      footprint: 2.7,

      onInterrupt(it) {
        if (it.id === "door-seal-fault") { tempGauge.children[0].material = mat(0xd2312b, { emissive: 0xc01810, ei: 1.2, rough: 0.4 }); }
        if (it.id === "buddy-no-response-fault") { buddy.visible = false; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "door-seal-fault") { tempGauge.children[0].material = mat(0x0d1c24, { rough: 0.5 }); }
        if (it.id === "buddy-no-response-fault") { buddy.visible = true; }
      },
      onStepComplete(step) {
        if (step.id === "room-hazard-read") {
          icePatch.material = mat(0x59c97b, { rough: 0.6, opacity: 0.2, transparent: true, cast: false });
          propPallet.visible = false;
          tornCurtain.visible = false;
        }
        if (step.id === "door-open") { doorLeaf.rotation.y = doorLeaf.userData.openAngle ?? 1.2; }
        if (step.id === "pull-pallet") { markedPallet.visible = false; }
        if (step.id === "door-close") { doorLeaf.rotation.y = 0; }
        if (step.id === "closing-log") {
          repaint(closingLogFace, signFace("PULL LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      animate(t, dt, session) {
        associate.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        buddy.userData.head.rotation.y = Math.sin(t * 0.6 + 1) * 0.4;
        void session; void dt;
      },
    };
  },
};
