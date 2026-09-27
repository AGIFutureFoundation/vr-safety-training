import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import { forkliftCounterbalance, lightSwitch } from "../../../shared/fleet.js";
import { dockLevelerBay } from "../../../shared/equipment.js";
import { palletStack, shippingContainer } from "../../../shared/props.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mail Handler Forklift & Container Dock VR — Manufacturing &
// Automation, NPMHU mail handlers. A counterbalance forklift's own daily
// inspection worked before the seat is ever sat in, the seatbelt actually
// fastened rather than assumed, the horn tested before the truck ever
// moves, the container dock read for a pedestrian in the travel path and a
// trailer nobody has chocked yet, a load lifted and set down at a
// controlled, watched descent, and the shift logged.
//
// No rated capacity, dock clearance or trailer weight this platform is not
// certain of is stated — those live on the forklift's own data plate, the
// dock's posted limit and the plant's own container-handling procedure.

const ML5_PAL = palette("postal");
const ML5_ACCENT = ML5_PAL.accent;

export const SIM_ML_MAIL_HANDLER_FORKLIFT_AND_CONTAINER_DOCK = {
  id: "ml-mail-handler-forklift-and-container-dock",
  index: "ml-5",
  domain: "Postal & Mail Processing",
  trade: "Mail handler — forklift and container dock operations, NPMHU",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "OSHA 29 CFR 1910.178 powered industrial trucks; the Revised NIOSH Lifting Equation for the manual portion of container handling; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, as the model for a written forklift and dock safety programme; NPMHU training for mail handler equipment and dock operations",
  name: "Mail Handler Forklift & Container Dock",
  title: simTitle("Mail Handler Forklift & Container Dock"),
  tagline: "A counterbalance forklift's own daily inspection before the seat is sat in, the seatbelt fastened, the horn tested, the dock read for a pedestrian in the travel path and an unchocked trailer, a container lifted and travelled to a blind corner sounded rather than assumed clear, and the load set down on a controlled, watched descent",
  accent: ML5_ACCENT,
  accentCss: `#${ML5_ACCENT.toString(16).padStart(6, "0")}`,
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "dock-certified", name: "Dock Certified", note: "A clean forklift inspection, the seatbelt fastened before the first move, a pedestrian and an unchocked trailer both read and answered, and a load set down under control" },

  game: system({
    name: "Dock Operations",
    currency: "DOCK",
    ranks: ["Dock Helper", "Mail Handler", "Forklift Operator", "Lead Handler", "Dock Certified"],
    badges: [
      { id: "cold-forklift-read", name: "Cold Forklift Read", note: "Every forklift defect found without a hint", test: AWARD.stepClean("forklift-walkaround") },
      { id: "belted-before-moving", name: "Belted Before Moving", note: "The seatbelt was fastened before the forklift ever moved", test: AWARD.stepClean("seat-and-belt") },
      { id: "controlled-set-down", name: "Controlled Set-Down", note: "The load was lowered on a fully controlled descent", test: AWARD.stepClean("stack-lower") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "on-time", name: "On Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "safe-dock", name: "Safe Dock", note: "No unsafe action anywhere in the run", test: AWARD.safe },
    ],
  }),

  supportLine: "your NPMHU local's member assistance representative, or the plant's own employee assistance line",

  hazards: {
    "missing-seatbelt-hazard": "This forklift's seatbelt is missing from its mount entirely, not just unfastened. A counterbalance forklift can tip, and the belt is what keeps an operator inside the overhead guard's own protection rather than being thrown clear of it and landing under the truck as it comes down.",
    "damaged-fork-hazard": "The left fork tine has a visible crack near its heel, right where the load stress actually concentrates. A cracked fork can fail under a load it looks perfectly capable of carrying, and there is no way to tell how much life it has left in it just by looking twice.",
    "pedestrian-in-path-hazard": "A mail handler on foot is walking directly through the forklift's own travel path, carrying totes and looking at them rather than at the truck. A pedestrian in a forklift's path is invisible to the operator the moment they are behind the mast, and the operator is the one who has to notice first.",
    "unchocked-trailer-hazard": "The trailer at this dock door has no wheel chocks set and its restraint arm is not engaged. A trailer that is not physically restrained can creep away from the dock as a forklift drives on and off it, opening a gap under the wheels that was not there a minute ago.",
  },

  lateNotes: {
    "container-load": "The container is lifted and travelled once the dock has been read for what's already wrong with it, not before.",
    "trailer-restraint-arm": "The trailer is restrained before any forklift travel across the dock plate, not after.",
  },

  interrupts: [
    {
      id: "pedestrian-crossing",
      kind: "Pedestrian crosses the travel path",
      after: "load-lift", delay: 3, seconds: 11,
      alert: "A mail handler on foot has stepped into the forklift's own travel path just ahead, carrying a tote and not looking up.",
      cue: "Sound the horn and hold the truck rather than continuing to travel with a pedestrian in the path.",
      target: "forklift-horn",
      why: "A loaded forklift's mast blocks exactly the view an operator needs to see someone walking into the path ahead, and the horn is what closes that gap — a mail handler with a tote in both hands and their eyes down has no other reason to look up in time.",
      missNote: "The forklift kept moving with a pedestrian already in the path. A mast-high load blocks the operator's own forward view at exactly the moment it matters most, and the horn is the only warning a distracted pedestrian gets.",
      wrongNote: "Not that — the horn and a hold come before the truck travels any further.",
    },
    {
      id: "second-forklift-approach",
      kind: "A second forklift approaches the blind corner",
      after: "chock-and-restrain", delay: 3, seconds: 11,
      alert: "A second forklift is approaching the same dock from the blind side of the container stack, on a converging path.",
      cue: "Call out over the radio before either truck commits to the corner.",
      target: "radio-call-out",
      why: "Two forklifts converging on a blind corner is exactly the kind of collision a plant floor's own layout cannot prevent by itself — a radio call is what lets both operators know the other is there before either one commits to a corner neither can actually see around.",
      missNote: "Neither truck called out before the corner. Two forklifts on a blind converging path find out about each other at the corner itself, which is the worst possible place to find out.",
      wrongNote: "Not that — the call-out comes before either truck commits to the blind corner.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the forklift inspection",
      cue: "Hi-vis vest and hard hat before stepping onto the dock floor.",
      why: "A dock floor mixes forklifts, foot traffic and overhead container handling, and the vest and hard hat are what make a handler visible to an operator and protected from whatever might come off a raised load.",
    },
    {
      id: "checklist-read", kind: "select", target: "forklift-checklist-board",
      title: "Read the daily inspection checklist",
      cue: "Read the forklift's own daily inspection checklist before walking around it.",
      why: "The checklist is what turns a walk-around from a glance into an actual inspection — it names the exact points a forklift fails at most often, and reading it first means nothing on that list gets skipped because it did not come to mind unprompted.",
    },
    {
      id: "forklift-walkaround", kind: "find", noHint: true,
      targets: ["missing-seatbelt-hazard", "damaged-fork-hazard"],
      itemNames: { "missing-seatbelt-hazard": "the missing seatbelt", "damaged-fork-hazard": "the cracked fork tine" },
      itemNotes: {
        "missing-seatbelt-hazard": "Missing from its mount entirely. This forklift does not move until a belt is fitted.",
        "damaged-fork-hazard": "A crack at the heel of the left fork. It gets reported and the fork swapped, not loaded and hoped for.",
      },
      decoyNotes: { "intact-fork-decoy": "That fork shows no cracks or bends at the heel. Nothing to flag there." },
      title: "Walk around the forklift before mounting it",
      cue: "Walk the truck cold before climbing on. Two things are already wrong with it — find them.",
      why: "A forklift that looks fine parked in its row is not the same as one an operator has actually inspected — a missing belt or a cracked fork both look like nothing from a few feet away, and finding them now costs a work order instead of costing a tip-over or a snapped fork under load.",
    },
    {
      id: "seat-and-belt", kind: "sequence", anyOrder: false,
      targets: ["forklift-seat", "forklift-seatbelt"],
      itemNames: { "forklift-seat": "mount the seat", "forklift-seatbelt": "fasten the seatbelt" },
      title: "Mount up and belt in",
      cue: "Mount the seat, then fasten the seatbelt — in that order, before touching a single control.",
      why: "The belt only does its job if it is fastened before the truck ever moves, not reached for after the first turn already feels a little off — a counterbalance forklift's own stability depends on the operator staying inside the overhead guard exactly where the belt keeps them.",
      outOfOrderNote: "Seat, then belt — a belt fastened after the truck is already moving has already missed the turn it was there for.",
    },
    {
      id: "horn-check", kind: "select", target: "forklift-horn",
      title: "Test the horn before moving",
      cue: "Sound the horn once before the forklift's first move of the shift.",
      why: "A dock floor is loud and full of blind corners, and the horn is the one warning a pedestrian or another operator gets before a loaded truck arrives — testing it now is how a dead horn gets found in the yard, not at the one blind corner where it was actually needed.",
    },
    {
      id: "capacity-check", kind: "gauge", target: "capacity-plate-gauge",
      title: "Check the load against the capacity plate",
      cue: "Read the forklift's own rated capacity plate and commit once the container's load is confirmed within it.",
      why: "A forklift's capacity plate is rated for a specific load at a specific fork height, not a general sense of 'this looks liftable' — reading it against what is actually on the forks is what keeps a stable-looking lift from turning into a front-end tip the moment the mast comes up.",
      gauge: { label: "RATED CAPACITY", speed: 0.6, green: [0.2, 0.6], readout: (t) => (t > 0.6 ? "over plate — do not lift" : "within plate"), missNote: "Not confirmed within the plate — check the rating again before lifting." },
    },
    {
      id: "dock-hazard-read", kind: "find", noHint: true,
      targets: ["pedestrian-in-path-hazard", "unchocked-trailer-hazard"],
      itemNames: { "pedestrian-in-path-hazard": "the pedestrian in the travel path", "unchocked-trailer-hazard": "the unchocked trailer" },
      itemNotes: {
        "pedestrian-in-path-hazard": "Walking through the travel path with a tote, not looking up. The path is cleared before the forklift enters it.",
        "unchocked-trailer-hazard": "No chocks set, restraint arm disengaged. The trailer is restrained before anything crosses the dock plate onto it.",
      },
      decoyNotes: { "chocked-trailer-decoy": "That trailer is chocked and the restraint arm is engaged, green light showing. Nothing to flag there." },
      title: "Read the dock before crossing it",
      cue: "Look over the dock before the forklift crosses it. Two things are already wrong with it — find them.",
      why: "A dock that looks like a normal shift in progress can still be hiding a pedestrian about to walk into the travel path or a trailer nobody has actually restrained yet — both are invisible from a glance and both are exactly what a forklift's own approach can turn into a real injury if they go unnoticed.",
    },
    {
      id: "chock-and-restrain", kind: "turn", target: "trailer-restraint-arm",
      title: "Engage the trailer restraint",
      cue: "Turn the restraint control to engage the arm and confirm the green light before crossing the dock plate.",
      why: "A trailer that can creep away from the dock opens a gap under the wheels of anything that crosses onto it — the restraint arm is what keeps that trailer physically pinned in place for as long as a forklift needs to be on or off it.",
      turn: { turns: 0.4, axis: "x", label: "RESTRAINT ARM" },
    },
    {
      id: "load-lift", kind: "drag", target: "container-load",
      title: "Lift and travel the container",
      cue: "Lift the container clear of the stack and carry it across the dock to the trailer.",
      why: "A load lifted low and travelled steadily is a load the operator can see around and stop quickly if the path ahead changes; a load raised high just to clear the stack turns the same short travel into a rolling blind spot for anyone crossing in front of it.",
      drag: { to: "container-dock-socket", radius: 0.5, missNote: "Not onto the trailer — carry the container all the way across before setting it down." },
    },
    {
      id: "stack-lower", kind: "hold", target: "container-load", seconds: 8,
      title: "Set the load down under control",
      cue: "Hold the lower control until the container is fully seated, watching the descent the whole way down.",
      why: "A load dropped the last few inches rather than set down slowly can shift, tip or crush whatever is under it, and holding the lower control through the full descent — rather than letting go once it looks close enough — is what keeps the set-down controlled instead of merely quick.",
      holdBreakNote: "The lower control was released before the container was fully seated. A load let go partway down finishes its descent on its own terms, not the operator's.",
    },
    {
      id: "spotter-checkin", kind: "select", target: "spotter-radio",
      title: "Check in with the spotter",
      cue: "Confirm with the spotter that the load is seated and the trailer is clear before backing off the dock plate.",
      why: "A spotter sees the trailer's own blind corners from a position the operator cannot, and checking in before backing off the dock plate is what turns 'it looked clear from the seat' into an actual confirmation from someone who could see the whole picture.",
    },
    {
      id: "closing-log", kind: "select", target: "dock-log-panel",
      title: "Log the inspection and the load",
      cue: "Log the forklift defects found, the load moved, and the dock hazards cleared before the shift closes.",
      why: "The log is what turns one cracked fork and one unchocked trailer into a pattern the plant's own safety committee can actually see — found and fixed but never logged is a recurring problem nobody upstream ever gets the chance to solve for good.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.9, ML5_ACCENT);

    // ------------------------------------------------------------------ dock floor
    const groundMesh = box(g, 7.4, 0.14, 6.6, 0, 0.07, 0, 0xffffff, { rough: 0.86 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5c6266", base2: "#4f5559", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.86, metal: 0.06, color: ML5_PAL.ground },
    );
    for (const sx of [-1.8, 1.8]) box(g, 0.06, 0.007, 6.0, sx, 0.148, 0, ML5_PAL.trim, { rough: 0.6, cast: false });
    // The forklift's own marked travel lane down the middle of the floor.
    box(g, 1.0, 0.003, 5.0, 0, 0.145, -0.4, 0xf2c14b, { rough: 0.6, cast: false, opacity: 0.5 });

    // ------------------------------------------------------------------ the forklift
    const forklift = forkliftCounterbalance(g, -1.6, 0.14, 1.6, { ry: -Math.PI / 2 });
    const FP = forklift.userData.parts;
    reg2(FP.forks, "damaged-fork-hazard");
    const forkCrack = decal(FP.forks, 0.04, 0.03, 0.3, 0.22, 0.08, signFace("×", { bg: "transparent", accent: "#0d1013", scale: 0.9 }), { px: 64 });
    void forkCrack;
    const seatbeltMount = group(FP.seat, 0, 0.4, -0.2);
    box(seatbeltMount, 0.06, 0.03, 0.02, 0, 0, 0, 0x8a8f95, { rough: 0.6, metal: 0.4 });
    reg2(seatbeltMount, "missing-seatbelt-hazard");
    reg2(FP.seat, "forklift-seat");
    const seatbeltProp = group(FP.seat, 0, 0.4, 0);
    seatbeltProp.visible = false;
    box(seatbeltProp, 0.4, 0.03, 0.02, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    reg2(seatbeltProp, "forklift-seatbelt");
    const hornButton = box(FP.controls, 0.05, 0.03, 0.05, 0, 0.24, 0, 0xd2312b, { rough: 0.5 });
    reg2(hornButton, "forklift-horn");
    const capacityPlate = instrument(forklift, 0.4, 1.1, 0.3, { idle: "--", color: ML5_ACCENT, w: 0.12, d: 0.1 });
    holoTag(capacityPlate, "capacity plate", 0, 0.2, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(capacityPlate, "capacity-plate-gauge");
    lightSwitch(FP.beacon, mat(0xf2a23b, { emissive: 0xf2a23b, ei: 1.5, rough: 0.4 }))(false);

    // ------------------------------------------------------------------ container stack + dock
    const stack = shippingContainer(g, -1.0, 0.14, -1.6, { ry: Math.PI / 2, colour: 0x3f6f9a });
    holoTag(stack, "container stack", 0, 3.0, 0, { css: "#2f6fb0", w: 0.34 });
    const containerLoad = group(g, -1.0, 0.9, -1.6);
    box(containerLoad, 0.9, 0.6, 0.6, 0, 0, 0, 0x3f6f9a, { rough: 0.6, finish: "brushed" });
    reg2(containerLoad, "container-load");
    void stack;

    const dock = dockLevelerBay(g, 2.4, 0.14, -1.0, { ry: Math.PI });
    const DP = dock.userData.parts;
    reg2(DP.restraintArm, "unchocked-trailer-hazard");
    // A second, invisible marker on the same arm for the later turn step —
    // reg() twice on one object would overwrite the first hitId.
    const restraintTurnTarget = group(DP.restraintArm, 0, 0.02, 0);
    reg2(restraintTurnTarget, "trailer-restraint-arm");
    const dockSocket = group(g, 2.4, 0.9, -1.6);
    hits["container-dock-socket"] = dockSocket;

    const properTrailerDecoy = group(g, 2.4, 0.14, -3.4);
    box(properTrailerDecoy, 0.4, 0.3, 0.2, 0, 0.2, 0, 0x2b2f34, { rough: 0.6 });
    reg2(properTrailerDecoy, "chocked-trailer-decoy");

    // ------------------------------------------------------------------ pedestrian + second forklift
    const pedestrian = standingFigure(g, 0.2, -1.6, { ry: 1.6, cloth: 0x2b3138, vest: ML5_PAL.trim });
    reg2(pedestrian, "pedestrian-in-path-hazard");
    const secondForklift = forkliftCounterbalance(g, 3.6, 0.14, -3.4, { ry: Math.PI / 2, livery: { colour: 0xd8232a } });
    secondForklift.visible = false;
    const radioCallOut = group(g, 1.6, 0, -0.4, 0.3);
    box(radioCallOut, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(radioCallOut, "radio call-out", 0, 1.35, 0, { css: "#2f6fb0", w: 0.32 });
    reg2(radioCallOut, "radio-call-out");

    // ------------------------------------------------------------------ PPE, boards, crew
    const ppeRack = group(g, -3.2, 0, 2.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, ML5_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#2f6fb0", w: 0.28 });
    reg2(vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.6, 0);
    cyl(hatProp, 0.11, 0.11, 0.08, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.2, 0, { css: "#2f6fb0", w: 0.26 });
    reg2(hatProp, "hard-hat");

    const checklistBoard = holoPanel(g, 0.58, 0.4, -3.2, 1.5, 1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f6fb0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9b98f";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DAILY INSPECTION — FL-3", w * 0.06, h * 0.16);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Seatbelt · forks · horn", "Hydraulics · tyres · lights"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.44 + i * 0.2)));
    }, { ry: 0.5, accent: ML5_ACCENT });
    reg2(checklistBoard, "forklift-checklist-board");

    const spotterRadio = group(g, 3.4, 0, 0.6, -0.4);
    box(spotterRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(spotterRadio, "spotter radio", 0, 1.35, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(spotterRadio, "spotter-radio");
    const spotter = standingFigure(g, 3.6, 1.2, { ry: -1.6, cloth: 0x37505f, vest: ML5_PAL.accent, helmet: 0xf2c14b });
    void spotter;

    const logPanel = holoPanel(g, 0.46, 0.3, -3.2, 1.5, 2.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DOCK LOG", w / 2, h * 0.36);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Inspection · load · hazards", w / 2, h * 0.68);
    }, { ry: -0.5, accent: 0xd8232a });
    reg2(logPanel, "dock-log-panel");
    const logFace = logPanel.userData.face;

    return {
      hits,
      footprint: 2.9,

      onStepComplete(step) {
        if (step.id === "forklift-walkaround") {
          forkCrack.visible = false;
        }
        if (step.id === "seat-and-belt") { seatbeltProp.visible = true; }
        if (step.id === "dock-hazard-read") { pedestrian.visible = false; }
        if (step.id === "chock-and-restrain") { DP.restraintArm.rotation.z = 0.3; }
        if (step.id === "load-lift") { containerLoad.position.set(2.4, 0.9, -1.6); }
        if (step.id === "closing-log") {
          repaint(logFace, signFace("SHIFT LOGGED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.36 }));
        }
      },

      onInterrupt(it) {
        if (it.id === "pedestrian-crossing") { pedestrian.visible = true; }
        if (it.id === "second-forklift-approach") { secondForklift.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pedestrian-crossing") { pedestrian.visible = false; }
        if (it.id === "second-forklift-approach") { secondForklift.visible = false; }
      },

      animate(t, dt, session) {
        void t; void dt; void session;
      },
    };
  },
};
