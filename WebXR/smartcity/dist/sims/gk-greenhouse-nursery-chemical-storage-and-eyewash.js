import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, concreteFace, tileFace, palette, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Greenhouse & Nursery Chemical Storage and Eyewash VR —
// Grounds & Landscaping.
//
// A nursery's chemical storage room kept the way its own labels and SDS
// binder require: incompatible chemicals segregated rather than shelved
// together, the path to the eyewash station kept clear, the ventilation
// fan confirmed running before anything volatile is decanted, the eyewash
// station itself activated and flow-tested rather than assumed ready, and
// every container relabelled the moment it is opened. No exposure limit,
// storage distance or flush duration this platform is not certain of
// appears here — every one of them is "per the label" or "per the SDS".

const GKN_ACCENT = 0x4fd6a5;
const GKN_PAL = palette("grounds");

export const SIM_GK_GREENHOUSE_NURSERY_CHEMICAL_STORAGE_AND_EYEWASH = {
  id: "gk-greenhouse-nursery-chemical-storage-and-eyewash",
  index: "gk-12",
  domain: "Grounds & Landscaping",
  trade: "Nursery and greenhouse grounds worker — SEIU grounds and building staff",
  category: "Grounds & Landscaping",
  district: "fairway-park",
  weather: "clear",
  certification: "OSHA 29 CFR 1910.1200 hazard communication, 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.133 eye and face protection, 29 CFR 1910.134 respiratory protection and 29 CFR 1910.151 medical services and first aid; ANSI Z358 emergency eyewash and shower equipment; Federal Insecticide, Fungicide, and Rodenticide Act (FIFRA) pesticide storage requirements; SEIU grounds and building staff training",
  name: "Greenhouse & Nursery Chemical Storage and Eyewash",
  title: simTitle("Greenhouse & Nursery Chemical Storage and Eyewash"),
  tagline: "A nursery chemical storage room kept the way the labels require: incompatible chemicals segregated, the eyewash path kept clear, the ventilation confirmed running, the eyewash station itself flow-tested, and every opened container relabelled",
  accent: GKN_ACCENT,
  accentCss: "#4fd6a5",
  parSeconds: 305,
  footprint: 2.6,
  badge: { id: "storage-secured", name: "Storage Secured", note: "Chemicals segregated, the eyewash path clear and flow-tested, the ventilation confirmed, and every container properly labelled" },

  supportLine: "your union steward or the nursery's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Storage Tech", "Storage Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "segregated", name: "Properly Segregated", note: "Never stored incompatible chemicals together", test: AWARD.stepClean("segregate-chemicals") },
      { id: "eyewash-tested", name: "Eyewash Tested", note: "Flow-tested the eyewash station rather than assuming it worked", test: AWARD.stepClean("eyewash-flush-test") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-hands", name: "Steady Hands", note: "Held the eyewash and fume gauges near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-check", name: "Quick Check", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "store-acid-with-oxidizer": "You stored the acid on the same shelf as the oxidizer. The SDS for each one exists precisely to flag which chemicals cannot share a shelf, and an incompatible pair stored together is one spill or one cracked container away from a reaction neither label was written expecting to happen on its own.",
    "block-eyewash-access": "You stacked stock in front of the path to the eyewash station. An eyewash a splashed person cannot actually reach within seconds is not a working safety device — it is a fixture on the wall that happens to be there, and the fifteen seconds it takes to move stock out of the way is not a fifteen seconds anyone has after an actual splash.",
    "mix-chemicals-in-open-container": "You poured a second chemical into a container that already held a different one. Two products that are each safe on their own can react the moment they are combined in an open container, and doing that without knowing both SDS sheets agree it is safe is exactly how a routine transfer becomes a fume release.",
    "skip-ppe-during-transfer": "You transferred the chemical without gloves or eye protection on. The moment of highest exposure in this whole room is the pour — the container open, the product moving — and skipping the PPE right then is skipping it for the one part of the job it actually has to cover.",
  },

  lateNotes: {
    "expired-product-unlabeled": "A container with no legible label or a date long past is treated as unknown hazardous waste until it is identified, not assumed safe because it has been sitting there a while.",
    "eyewash-station": "The eyewash gets activated and flow-tested on its own schedule, not only checked by looking at it — a fixture that looks fine can still fail to flow when it is actually needed.",
  },

  interrupts: [
    {
      id: "eyewash-flow-drops",
      kind: "Equipment failure",
      after: "eyewash-flush-test", delay: 3, seconds: 10,
      alert: "The eyewash flow has dropped to a trickle mid-test, and discoloured water is coming through the line.",
      cue: "Open the backup water valve before calling the test complete.",
      target: "backup-water-valve",
      why: "An eyewash that trickles instead of flushing does not actually clear a chemical from an eye in the time that matters, and opening the backup valve immediately — rather than logging the test as passed on a fixture that just failed it — is what keeps this discovery from happening for the first time during an actual splash.",
      missNote: "The test was logged while the flow was still trickling. An eyewash that fails its own test is not a working eyewash no matter what the log says.",
      wrongNote: "Not that — the backup water valve is what this trickle needs, before the test is called complete.",
    },
    {
      id: "ventilation-fan-fails",
      kind: "Ventilation failure",
      after: "monitor-fume-reading", delay: 4, seconds: 11,
      alert: "The fume reading has spiked as the ventilation fan stalls mid-decant, and vapour is starting to build in the room.",
      cue: "Hit the emergency ventilation switch before the decanting continues.",
      target: "emergency-vent-switch",
      why: "A stalled fan during an active decant means vapour is building with nothing carrying it away, and the emergency switch is what brings backup ventilation online immediately — continuing the pour while the reading climbs is trusting a room that has already stopped doing the one thing that makes decanting this product safe indoors.",
      missNote: "The decanting continued while the fume reading kept climbing. A room that has stopped ventilating does not clear itself while the pour is still going.",
      wrongNote: "Not that — the emergency ventilation switch is what this spike needs, before the decanting continues.",
    },
  ],

  steps: [
    {
      id: "read-sds-binder", kind: "select", target: "sds-binder-index",
      title: "Check the SDS binder index",
      cue: "Confirm every chemical in the room has a current safety data sheet on file before touching anything.",
      why: "The SDS binder is the one place this room's own hazards, compatibilities and first-aid steps are all written down — checking the index before the walk-through is what confirms nothing in the room is being handled without its own safety data sheet backing it up.",
    },
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["chemical-gloves", "eye-protection", "apron"],
      itemNames: { "chemical-gloves": "chemical-resistant gloves", "eye-protection": "eye protection", apron: "chemical-resistant apron" },
      title: "Suit up before handling anything",
      cue: "Chemical-resistant gloves, eye protection and an apron before any container is opened.",
      why: "A storage room inspection still means touching containers, checking labels and sometimes decanting product, and the gloves, eye protection and apron going on first is what covers every one of those moments rather than only the ones that felt risky enough to suit up for.",
    },
    {
      id: "walk-the-storage-room", kind: "find", noHint: true,
      targets: ["incompatible-shelf", "expired-product-unlabeled", "blocked-eyewash-path"],
      itemNames: { "incompatible-shelf": "the shelf mixing incompatible chemicals", "expired-product-unlabeled": "the container with no legible label", "blocked-eyewash-path": "the stock blocking the eyewash path" },
      itemNotes: {
        "incompatible-shelf": "A shelf mixing chemicals that should never touch each other is exactly what a spill or a cracked container turns into a reaction nobody planned for.",
        "expired-product-unlabeled": "A container with no legible label is treated as unknown until it is identified — never assumed safe because it has been sitting there a while.",
        "blocked-eyewash-path": "Stock stacked in front of the eyewash is a working fixture nobody can actually reach in the seconds after a splash.",
      },
      decoyNotes: { "properly-labeled-shelf": "That shelf is labelled, compatible and clear of anything blocking access to it. Nothing to flag there." },
      title: "Walk the storage room before touching anything",
      cue: "Three things in this room change the plan — find them before the first container is moved.",
      why: "A storage room that looks organised from the doorway is not the same thing as a room someone has actually walked and checked, and an incompatible shelf, an unlabelled container or a blocked eyewash path are exactly what a walk-down catches before any of them becomes the reason someone needed the eyewash and could not reach it.",
    },
    {
      id: "confirm-containment", kind: "select", target: "containment-tray-check",
      title: "Confirm secondary containment",
      cue: "Check that every shelf holding liquid product sits over its own secondary containment.",
      why: "Secondary containment is what keeps a leaking or overturned container's contents on a tray instead of spreading across the floor toward whatever else is stored nearby — confirming it is under every shelf that needs it is what makes a small leak stay a small leak.",
    },
    {
      id: "segregate-chemicals", kind: "sequence", anyOrder: true,
      targets: ["separate-acid-shelf", "separate-oxidizer-shelf"],
      itemNames: { "separate-acid-shelf": "move the acid to its own shelf", "separate-oxidizer-shelf": "move the oxidizer to its own shelf" },
      title: "Segregate the incompatible chemicals",
      cue: "Move the acid and the oxidizer to their own separate, compatible shelving.",
      why: "Segregating chemicals by compatibility rather than by what fits on the nearest open shelf is what actually prevents the reaction their own SDS sheets warn about — the segregation is the safety control, not an afterthought once everything is already shelved.",
    },
    {
      id: "check-ventilation-fan", kind: "select", target: "vent-fan-check",
      title: "Confirm the ventilation fan is running",
      cue: "Check the ventilation fan is operating before decanting anything volatile.",
      why: "A room's rated ventilation is what actually keeps a decanted vapour from building up to a level the SDS warns about, and confirming the fan is running before the first container is opened is what makes that ventilation something the crew can trust rather than assume.",
    },
    {
      id: "test-eyewash-valve", kind: "turn", target: "eyewash-test-valve",
      title: "Activate the eyewash station",
      cue: "Turn the activation valve to start the weekly eyewash flow test.",
      why: "An eyewash station activated on its own testing schedule, rather than only looked at, is the only way to actually know the plumbing behind it still delivers a working flow — turning the valve is what starts a real test instead of a visual check that tells the crew nothing about whether water will actually come out when it is needed.",
      turn: { turns: 0.35, axis: "z", label: "EYEWASH VALVE" },
    },
    {
      id: "eyewash-flush-test", kind: "hold", target: "eyewash-station", seconds: 5,
      title: "Hold the flush test to completion",
      cue: "Hold under the eyewash stream for the full flush test.",
      why: "A flush test cut short does not actually confirm the flow rate or the water quality the way the full test does — holding it to completion is what turns this into proof the eyewash works, not just a station that briefly ran.",
      holdBreakNote: "Stepped out from under the stream before the flush test finished. Hold the full test every time, not just until the water starts.",
    },
    {
      id: "check-eyewash-flow", kind: "gauge", target: "eyewash-flow-gauge",
      title: "Check the eyewash flow rate",
      cue: "Read the flow gauge and commit only inside the manufacturer's band.",
      why: "A flow that reads inside the manufacturer's own band is what actually confirms this eyewash will rinse an eye effectively — a trickle that looks like flow from across the room is not the same thing as a flow rate proven on the gauge.",
      gauge: {
        label: "EYEWASH FLOW RATE", speed: 0.58, green: [0.45, 0.72],
        readout: (t) => `${(0.2 + t * 0.6).toFixed(2)} gpm`,
        missNote: "Outside the manufacturer's band. Let the line clear and the reading settle before committing it.",
      },
    },
    {
      id: "stage-spill-kit", kind: "drag", target: "spill-kit",
      title: "Stage the spill kit at the entrance",
      cue: "Carry the spill kit from storage to the room's entrance.",
      why: "A spill kit staged at the entrance is one anyone can reach without walking past whatever just spilled — kept in a back corner, it is a kit that requires crossing the hazard to reach the thing meant to contain it.",
      drag: { to: "storage-entrance-socket", radius: 0.4, missNote: "Not at the entrance — carry the spill kit to where the entrance actually is." },
    },
    {
      id: "monitor-fume-reading", kind: "track", target: "fume-monitor", seconds: 8,
      title: "Monitor the fume reading while decanting",
      cue: "Keep the fume reading steady in band for the whole decanting pass.",
      why: "A fume reading held steady in band confirms the ventilation is actually keeping pace with the decanting, and a reading that drifts upward mid-pour is the room's own early warning that the air is not clearing the way the SDS assumes it will.",
      track: {
        start: 0.15, green: [0.15, 0.45], rise: 0.5, fall: 0.44, drift: 0.12,
        label: "FUME READING",
        readout: (v) => (v > 0.45 ? "rising — check ventilation" : "steady, ventilation keeping pace"),
      },
      holdBreakNote: "The fume reading climbed out of band during the pour. Pause decanting until the reading settles back down.",
    },
    {
      id: "label-new-container", kind: "select", target: "label-new-container",
      title: "Label the newly opened container",
      cue: "Apply a proper label to the container the moment it is opened and repackaged.",
      why: "A container relabelled the instant it is opened is a container anyone in the room can identify later — one left with a faded or missing label is the exact 'expired-product-unlabeled' hazard the walk-down at the start of this shift was trying to prevent from happening again.",
    },
    {
      id: "close-up-storage", kind: "sequence", anyOrder: true,
      targets: ["lock-storage-room", "post-inventory-sign"],
      itemNames: { "lock-storage-room": "lock the storage room", "post-inventory-sign": "post the current chemical inventory sign" },
      title: "Close up the storage room",
      cue: "Lock the room and post the current inventory sign before leaving.",
      why: "Locking the room keeps access limited to people who actually need it, and a posted, current inventory sign is what tells anyone responding to an emergency exactly what is behind that door without having to open every container to find out.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the storage inspection log",
      cue: "Log the segregation check, the eyewash flow reading and the ventilation confirmation before leaving.",
      why: "The storage inspection log is what the next inspection and the safety committee both read — a room checked cleanly but never logged leaves nothing behind to prove the eyewash was actually flow-tested and the chemicals actually segregated today.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, GKN_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.2, 0.14, 5.8, 0, 0.07, 0, 0xffffff, { rough: 0.9 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth" }), { repeat: 5, px: 512 }),
      { rough: 0.9, metal: 0.02, color: 0xc7cac6 },
    );
    const floorTile = box(g, 3.4, 0.02, 3.0, 0, 0.15, -0.2, 0xffffff, { rough: 0.6, cast: false });
    floorTile.material = texturedMat(
      surfaceTexture((cx, w, h) => tileFace(cx, w, h, {}), { repeat: 4, px: 384 }),
      { rough: 0.6, metal: 0.05, color: 0xe8ecee },
    );

    // ------------------------------------------------------------------ storage shelving
    const shelving = group(g, -1.4, 0, 0.4, 0.3);
    box(shelving, 1.6, 0.05, 0.4, 0, 0.5, 0, GKN_PAL.trim, { rough: 0.55, metal: 0.3 });
    box(shelving, 1.6, 0.05, 0.4, 0, 0.9, 0, GKN_PAL.trim, { rough: 0.55, metal: 0.3 });
    const containmentTray = box(shelving, 1.6, 0.03, 0.42, 0, 0.16, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    reg(hits, containmentTray, "containment-tray-check");
    const acidJug = cyl(shelving, 0.06, 0.07, 0.2, -0.5, 0.62, 0, 0xf2c14b, { rough: 0.5, metal: 0.2, seg: 14 });
    reg(hits, acidJug, "incompatible-shelf");
    const oxidizerJug = cyl(shelving, 0.06, 0.07, 0.2, -0.3, 0.62, 0, 0x59c97b, { rough: 0.5, metal: 0.2, seg: 14 });
    const acidTargetShelf = box(shelving, 0.1, 0.1, 0.1, -0.6, 0.9, 0, GKN_PAL.trim, { rough: 0.5, metal: 0.3 });
    reg(hits, acidTargetShelf, "separate-acid-shelf");
    const oxidizerTargetShelf = group(shelving, 0.6, 0.9, 0);
    const oxidizerTargetMesh = box(oxidizerTargetShelf, 0.1, 0.1, 0.1, 0, 0, 0, GKN_PAL.trim, { rough: 0.5, metal: 0.3 });
    reg(hits, oxidizerTargetShelf, "separate-oxidizer-shelf");
    const mixHazardZone = box(shelving, 0.3, 0.1, 0.3, -0.4, 0.62, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, mixHazardZone, "mix-chemicals-in-open-container");
    const unlabeledContainer = cyl(shelving, 0.05, 0.06, 0.18, 0.4, 0.6, 0, 0x8a8580, { rough: 0.6, seg: 12 });
    reg(hits, unlabeledContainer, "expired-product-unlabeled");
    const acidOxidizerHazardZone = box(shelving, 0.35, 0.1, 0.3, -0.4, 0.62, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, acidOxidizerHazardZone, "store-acid-with-oxidizer");
    holoTag(shelving, "chemical storage", 0, 1.1, 0, { css: "#4fd6a5", w: 0.34 });

    const properShelf = group(g, -1.4, 0, -0.8);
    const properShelfMesh = box(properShelf, 0.3, 0.008, 0.2, 0, 0.15, 0, 0x4fd6a5, { rough: 0.6, cast: false });
    reg(hits, properShelf, "properly-labeled-shelf");

    // ------------------------------------------------------------------ eyewash + ventilation
    const eyewash = group(g, 0.6, 0, 1.6, -0.4);
    cyl(eyewash, 0.04, 0.04, 0.7, 0, 0.35, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 12 });
    const eyewashBasin = torus(eyewash, 0.1, 0.02, 0, 0.7, 0, 0xbfeaf7, { rough: 0.3, seg: 10, seg2: 20 });
    eyewashBasin.rotation.x = Math.PI / 2;
    reg(hits, eyewash, "eyewash-station");
    const eyewashValveObj = cyl(eyewash, 0.02, 0.02, 0.05, 0, 0.55, 0.05, 0x59c97b, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, eyewashValveObj, "eyewash-test-valve");
    const backupValveObj = cyl(eyewash, 0.02, 0.02, 0.05, 0.06, 0.55, 0.05, 0xd2312b, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, backupValveObj, "backup-water-valve");
    holoTag(eyewash, "eyewash station", 0, 0.95, 0, { css: "#4fd6a5", w: 0.32 });

    const stockBlocking = group(g, 0.3, 0, 1.3, 0.4);
    box(stockBlocking, 0.3, 0.3, 0.2, 0, 0.15, 0, 0x8a7050, { rough: 0.8 });
    reg(hits, stockBlocking, "blocked-eyewash-path");
    const blockAccessZone = box(g, 0.4, 0.3, 0.3, 0.3, 0.16, 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, blockAccessZone, "block-eyewash-access");

    const flowInst = instrument(g, 2.4, 0.9, 1.4, { ry: -0.4, idle: "-- gpm", color: GKN_ACCENT });
    holoTag(flowInst, "eyewash flow gauge", 0, 0.16, 0, { css: "#4fd6a5", w: 0.36 });
    reg(hits, flowInst, "eyewash-flow-gauge");

    const ventFan = group(g, -0.4, 1.4, -1.8, 0.3);
    torus(ventFan, 0.14, 0.02, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 8, seg2: 20 });
    for (let i = 0; i < 4; i++) { const blade = box(ventFan, 0.12, 0.02, 0.03, 0, 0, 0, 0x9aa1a8, { rough: 0.5, metal: 0.5 }); blade.rotation.z = (i * Math.PI) / 2; }
    reg(hits, ventFan, "vent-fan-check");
    const emergencyVentSwitchObj = box(g, 0.05, 0.06, 0.03, -0.7, 1.1, -1.8, 0xd2312b, { rough: 0.5 });
    reg(hits, emergencyVentSwitchObj, "emergency-vent-switch");
    const fumeMonitorInst = instrument(g, 2.4, 0.5, -0.4, { ry: -0.4, idle: "-- ppm", color: GKN_ACCENT });
    holoTag(fumeMonitorInst, "fume monitor", 0, 0.16, 0, { css: "#4fd6a5", w: 0.28 });
    reg(hits, fumeMonitorInst, "fume-monitor");

    // ------------------------------------------------------------------ paperwork + PPE
    const sdsBinder = group(g, -2.4, 0, 1.2, 0.4);
    box(sdsBinder, 0.24, 0.32, 0.05, 0, 0.16, 0, 0x2b3138, { rough: 0.6 });
    const sdsFace = decal(sdsBinder, 0.2, 0.14, 0, 0.24, 0.026, signFace("SDS INDEX", { bg: "#0d1c24", accent: "#4fd6a5", scale: 0.4 }), { px: 160 });
    reg(hits, sdsFace, "sds-binder-index");

    const ppeRack = group(g, -2.5, 0, -0.6, 0.4);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const gloveProp = box(ppeRack, 0.1, 0.05, 0.02, -0.1, 0.5, 0, 0x59c97b, { rough: 0.7 });
    reg(hits, gloveProp, "chemical-gloves");
    const eyeProp = box(ppeRack, 0.1, 0.04, 0.02, 0.02, 0.55, 0, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const apronProp = box(ppeRack, 0.16, 0.3, 0.015, 0.14, 0.35, 0, 0xd8c14b, { rough: 0.75 });
    reg(hits, apronProp, "apron");

    const skipPpeZone = box(shelving, 0.3, 0.3, 0.3, 0, 0.6, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, skipPpeZone, "skip-ppe-during-transfer");

    const spillKitObj = group(g, -2.4, 0, -1.6, 0.4);
    box(spillKitObj, 0.3, 0.2, 0.2, 0, 0.1, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, spillKitObj, "spill-kit");
    const entranceSocket = group(g, 1.8, 0, 2.2);
    hits["storage-entrance-socket"] = entranceSocket;

    const newContainerObj = cyl(g, 0.05, 0.06, 0.18, 1.4, 0.24, -0.6, 0xf2f2ea, { rough: 0.6, seg: 12 });
    reg(hits, newContainerObj, "label-new-container");

    const doorLockObj = box(g, 0.06, 0.1, 0.03, 2.0, 0.8, -2.0, 0x2b3138, { rough: 0.5 });
    reg(hits, doorLockObj, "lock-storage-room");
    const inventorySignObj = box(g, 0.3, 0.4, 0.02, 1.8, 0.4, -2.0, 0xf2c14b, { rough: 0.6 });
    reg(hits, inventorySignObj, "post-inventory-sign");

    const chest = toolChest(g, 2.6, 2.0, { ry: -0.5, color: GKN_ACCENT });

    const closingLog = group(g, 2.7, 0, -1.9, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("STORAGE LOG\nOPEN", { bg: "#11181f", accent: "#4fd6a5", scale: 0.22 }), { px: 320 });
    holoTag(closingLog, "storage log", 0, 1.34, 0, { css: "#4fd6a5", w: 0.32 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const worker = standingFigure(g, 0.0, 2.2, { ry: 3.0, cloth: 0x2b3138, vest: GKN_ACCENT, helmet: 0xf2f2f2 });
    holoTag(worker, "storage tech", 0, 1.95, 0.15, { css: "#4fd6a5", w: 0.3 });

    const stream = particles(eyewash, 14, 0xbfeaf7, { size: 0.015, life: 0.4, additive: true, opacity: 0.5 });
    stream.visible = false;
    const fumeCloud = particles(g, 12, 0xd8c99a, { size: 0.02, life: 0.5, additive: false, opacity: 0.14 });
    fumeCloud.visible = false;

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "eyewash-flow-drops") { eyewashBasin.material = mat(0xd8c14b, { rough: 0.4 }); stream.visible = true; }
        if (it.id === "ventilation-fan-fails") { fumeCloud.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "eyewash-flow-drops") { eyewashBasin.material = mat(0xbfeaf7, { rough: 0.3 }); stream.visible = false; }
        if (it.id === "ventilation-fan-fails") { fumeCloud.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-storage-room") {
          acidJug.material = mat(0x59c97b, { rough: 0.5, metal: 0.2 });
          unlabeledContainer.material = mat(0x59c97b, { rough: 0.6 });
          stockBlocking.children[0].material = mat(0x59c97b, { rough: 0.7 });
        }
        if (step.id === "eyewash-flush-test") { stream.visible = true; }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("STORAGE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.22 }));
          stream.visible = false;
        }
      },
      onHazard(hitId) { if (hitId === "mix-chemicals-in-open-container") { fumeCloud.visible = true; } },

      animate(t, dt, session) {
        worker.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        ventFan.rotation.z = t * (fumeCloud.visible ? 0 : 3);
        if (stream.visible) stream.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.08, 0.08, 0.1);
        if (fumeCloud.visible) fumeCloud.userData.step(dt, new THREE.Vector3(-0.4, 1.3, -1.7), 0.15, 0.15, 0.05);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-eyewash-flow") {
          const gpm = (0.2 + gg.t * 0.6).toFixed(2);
          repaint(flowInst.userData.screen, signFace(`${gpm} gpm`, {
            bg: "#0d1c24", accent: gg.t > 0.45 && gg.t < 0.72 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        const tk = session?.track;
        if (tk && session.step?.id === "monitor-fume-reading") {
          const ppm = Math.round(tk.v * 200);
          repaint(fumeMonitorInst.userData.screen, signFace(`${ppm} ppm`, {
            bg: "#0d1c24", accent: tk.v < 0.45 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
