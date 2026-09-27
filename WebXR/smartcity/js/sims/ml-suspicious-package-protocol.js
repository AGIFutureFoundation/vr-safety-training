import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { conveyorSection } from "../../../shared/equipment.js";
import { palletRackBay, palletStack } from "../../../shared/props.js";
import { palette, corrugatedFace, safetyStripeFace, blockFace } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Suspicious Package Protocol VR — Postal & Mail Processing.
// A processing plant's culling belt at the start of a sort, and one parcel
// that doesn't look right. The whole station is the facility's own plan
// worked in the order it asks for, and nothing more: the plan and the exits
// known before the shift, the parcel noticed and left exactly where it is,
// the belt stopped so it travels no further, people moved clear at a calm
// pace, the zone cordoned, hands washed, the supervisor told and the call
// made per the plan, everyone accounted for at the assembly point, and the
// area left alone until responders give the all clear.
//
// Deliberately generic. No device, substance or mechanism is described, no
// procedure or clause number is invented, and no distance, time or quantity
// is stated — the facility's emergency action plan and the responders on
// the day own all of those.

const SPP_PAL = palette("postal");
const SPP_ACCENT = SPP_PAL.accent;
const SPP_CSS = "#2f6fb0";

function sppBoard(ctx, w, h, title, lines, band = SPP_CSS) {
  ctx.fillStyle = "rgba(8,16,28,0.92)"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = band; ctx.fillRect(0, 0, w, 5);
  ctx.fillStyle = "#e3eefa";
  ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(title, w * 0.06, h * 0.2);
  ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
  lines.forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.44 + i * 0.16)));
}

export const SIM_ML_SUSPICIOUS_PACKAGE_PROTOCOL = {
  id: "ml-suspicious-package-protocol",
  index: "ml-7",
  domain: "Postal & Mail Processing",
  trade: "Mail processing clerk and mail handler — suspicious parcel on the culling belt",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "OSHA 29 CFR 1910.38 emergency action plans — the facility's own written plan for reporting an emergency, evacuating and accounting for everyone; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, as the model for a written plant safety programme; Labor Code §6310 protection against retaliation for stopping work and reporting a hazard; APWU training for mail processing clerks and NPMHU training for mail handlers, as the training bodies",
  name: "Suspicious Package Protocol",
  title: simTitle("Suspicious Package Protocol"),
  tagline: "The plan and the exits known before the sort, a parcel that doesn't look right left exactly where it is, the belt stopped, people moved clear, the zone cordoned, the call made per the plan, and nobody back in until responders give the all clear",
  accent: SPP_ACCENT,
  accentCss: SPP_CSS,
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "zone-held", name: "Zone Held", note: "A suspicious parcel left untouched, the area cleared and cordoned, the call made per the facility's plan, and the zone held until the all clear" },

  game: system({
    name: "Plant Emergency Standard",
    currency: "SORT",
    ranks: ["New Clerk", "Belt Certified", "Lead Clerk", "Tour Supervisor", "Emergency Plan Certified"],
    badges: [
      { id: "hands-off", name: "Hands Off", note: "The parcel left exactly where it was found", test: AWARD.stepClean("isolate") },
      { id: "all-accounted", name: "All Accounted", note: "The assembly headcount matched the tour roster", test: AWARD.stepClean("assembly-count") },
      { id: "zone-kept", name: "Zone Kept", note: "Nobody back in until responders gave the all clear", test: AWARD.stepClean("close-out") },
    ],
    challenges: [
      { id: "clean-tour", name: "Clean Tour", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-brief", name: "Steady Brief", note: "Held the responder brief the full count, first try", test: AWARD.unbroken },
      { id: "prompt-plan", name: "Prompt Plan", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-to-check-decoy": "A box cutter on the culling table. Opening a parcel to find out whether it's dangerous is exactly the thing the plan exists to prevent — the parcel stays closed and untouched, and finding out what it is belongs to the responders.",
    "carry-outside-decoy": "An empty tote labelled \"move it to the dock.\" Carrying a suspicious parcel outside feels like getting it away from people, but it means handling it, walking it past everyone between here and the door, and leaving it somewhere nobody is watching. It stays where it was found.",
    "fan-on-decoy": "A pedestal fan blowing straight across the belt. Moving air across a suspicious item can carry whatever is on it further across the floor — the facility's plan says what to do with fans and air handling, and switching one on here is not it.",
    "resume-sort-decoy": "A card reading \"dispatch deadline — restart belt at 0600 regardless.\" A deadline doesn't reopen a zone. The belt and the area stay down until responders give the all clear, and the plan protects the people who hold that line.",
  },

  lateNotes: {
    "incident-report": "Hold that — the report is written after responders give the all clear, not while the zone is still being held.",
    "notify-supervisor": "Not yet — move people clear and cordon the zone first, then make the call from outside it.",
  },

  steps: [
    {
      id: "plan-review", kind: "select", target: "emergency-plan-board",
      title: "Know the plan before the sort starts",
      cue: "Read the facility's posted emergency plan: who to tell, how to call it in and where the assembly point is.",
      why: "In the first minute of something going wrong nobody reads a binder. Knowing who to tell, how the call is made and where the tour assembles before the sort starts is what lets the right steps happen in the right order when a parcel looks wrong, instead of a crowd forming while people work it out.",
    },
    {
      id: "exit-scan", kind: "find", noHint: true,
      targets: ["blocked-exit", "dark-exit-sign"],
      itemNames: { "blocked-exit": "a pallet parked across the exit route", "dark-exit-sign": "an exit sign that isn't lit" },
      itemNotes: {
        "blocked-exit": "An evacuation that has to squeeze around a pallet is slower and more crowded than the plan assumes. It gets moved now, while moving it is a chore rather than an obstacle.",
        "dark-exit-sign": "An unlit exit sign is a route people won't find in a hurry, especially anyone new on the tour. It gets reported to maintenance before the sort starts, not noticed during an evacuation.",
      },
      title: "Walk the exit route before the belt starts",
      cue: "Two things on this route would slow an evacuation. Find them.",
      why: "The emergency action plan is only as good as the route it sends people along. Finding a blocked aisle or a dark sign before the belt runs means the plan works as written the day it is needed, rather than the day someone finally notices the route no longer matches the map.",
    },
    {
      id: "notice-parcel", kind: "select", target: "odd-parcel",
      title: "Notice the parcel that doesn't look right",
      cue: "Look at the parcel on the culling belt — the stain, the heavy tape, the restrictive markings, no return address. Look, don't touch.",
      why: "Most odd-looking parcels are just badly packed, but the plan asks for the same response every time because the clerk at the belt can't tell the difference by looking. Noticing it and saying so is the whole of the clerk's job at this point — the judgement about what it is belongs to the responders.",
    },
    {
      id: "stop-belt", kind: "turn", target: "belt-stop-selector",
      title: "Stop the belt",
      cue: "Turn the belt's selector to STOP so the parcel travels no further into the plant.",
      turn: { turns: 0.3, axis: "z", label: "BELT" },
      why: "A running belt carries the parcel toward more people and more machinery, and every metre it travels widens the area that has to be cleared. Stopping the belt at its own control, without reaching for the parcel, keeps the problem in one place.",
    },
    {
      id: "isolate", kind: "sequence", anyOrder: false,
      targets: ["hands-off-marker", "step-back-spot"],
      itemNames: { "hands-off-marker": "leave it exactly where it is", "step-back-spot": "step back from the belt" },
      title: "Leave it where it is, then step back",
      cue: "Keep your hands off the parcel — don't move, open, shake or smell it — then step back from the belt.",
      why: "Every time a suspicious parcel is handled, whatever risk it carries is disturbed and spread to whoever touched it. Leaving it exactly where it lies and then putting distance between yourself and it is the plan's first and most important instruction, and it costs nothing to follow.",
      outOfOrderNote: "Hands off first, then step back — backing away with the parcel still in hand has already broken the one rule that mattered.",
    },
    {
      id: "clear-area", kind: "track", target: "evac-pace", seconds: 5,
      title: "Move people clear at a calm pace",
      cue: "Walk the people near the belt toward the exit route — steady, not running, not dawdling.",
      why: "People follow the pace of whoever is leading them out. Running spreads alarm and causes falls on a plant floor full of trays and pallets; dawdling leaves people near the parcel longer than they need to be. A steady walk along the known route gets everyone clear in the order the plan expects.",
      track: { start: 0.5, green: [0.4, 0.6], rise: 0.5, fall: 0.5, drift: 0.12, label: "EVAC PACE", readout: (v) => (v < 0.4 ? "dawdling" : v > 0.6 ? "rushing" : "steady") },
      holdBreakNote: "The pace broke into a rush or stalled — bring it back to a steady walk rather than hurrying people along.",
    },
    {
      id: "cordon", kind: "drag", target: "cordon-stand",
      title: "Cordon the zone",
      cue: "Move the cordon stand across the aisle to the zone boundary the plan marks.",
      why: "Once the area is empty, the cordon is what keeps it empty — a forklift driver or a clerk from the next belt who didn't hear the call will walk straight in otherwise. A visible barrier does the job without anyone having to stand guard inside the zone.",
      drag: { to: "cordon-socket", radius: 0.45, missNote: "The cordon isn't across the aisle — a barrier to one side stops nobody walking in." },
    },
    {
      id: "air-per-plan", kind: "select", target: "fan-switch",
      title: "Handle fans and air as the plan directs",
      cue: "Switch off the local fans near the belt, as the facility's plan directs.",
      why: "Air moving across the belt can carry anything on the parcel's surface further across the floor. The facility's plan says who controls fans and air handling in an event like this; following it — rather than improvising with doors and fans — keeps the zone the size the responders will expect.",
    },
    {
      id: "wash-hands", kind: "select", target: "handwash-station",
      title: "Wash hands at the station outside the zone",
      cue: "Anyone who was at the belt washes their hands with soap and water at the station outside the cordon.",
      why: "Washing with soap and water is simple, harmless whether or not the parcel turns out to be anything, and it keeps whatever may have been on the belt from travelling on hands to faces, food and phones. It happens outside the zone so nobody lingers near the parcel to do it.",
    },
    {
      id: "notify", kind: "sequence",
      targets: ["notify-supervisor", "call-per-plan"],
      itemNames: { "notify-supervisor": "tell the supervisor", "call-per-plan": "make the call the plan names" },
      title: "Tell the supervisor and make the call per the plan",
      cue: "From outside the cordon, tell the supervisor and make the call the facility's plan names.",
      why: "The plan decides who calls whom, and following it means responders hear about the parcel once, clearly, from someone who saw it — rather than several times in several versions. Making the call from outside the cordon keeps the caller safe and able to answer follow-up questions.",
    },
    {
      id: "assembly-count", kind: "gauge", target: "roster-panel",
      title: "Account for everyone at the assembly point",
      cue: "Read the assembly headcount against the tour roster and commit only when everyone is accounted for.",
      why: "The first thing responders ask is whether anyone is still inside. A headcount matched against the tour roster answers it with a fact rather than a guess, and it is the step an emergency action plan exists to make routine, because a missing person is only found quickly when somebody notices they are missing.",
      gauge: { label: "ACCOUNTED FOR", speed: 0.55, green: [0.82, 1.0], readout: (t) => (t < 0.82 ? "names still missing" : "everyone accounted for"), missNote: "Committed with names still missing from the roster. Responders were told everyone was out when nobody actually knew." },
    },
    {
      id: "brief-responders", kind: "hold", target: "witness-clipboard", seconds: 5,
      title: "Stay at the assembly point to brief responders",
      cue: "Press and hold the witness clipboard: stay at the assembly point and be ready to tell responders what you saw.",
      why: "The clerk who noticed the parcel is the only person who can describe where it is, what it looked like and who was near it. Staying at the assembly point until responders arrive, rather than drifting back to work or home, puts that account in their hands when it is most useful.",
      holdBreakNote: "You left the assembly point before responders had your account. What you saw at the belt went with you.",
    },
    {
      id: "close-out", kind: "sequence", anyOrder: false,
      targets: ["all-clear-board", "incident-report"],
      itemNames: { "all-clear-board": "wait for the responders' all clear", "incident-report": "write the incident report" },
      title: "Wait for the all clear, then report",
      cue: "Nobody re-enters until responders give the all clear; then write the incident report.",
      why: "The all clear comes from the responders who assessed the parcel, not from a supervisor under deadline pressure or from time passing. The report is written after, while memories are fresh, so the facility can check whether its plan worked as written and fix what didn't.",
      outOfOrderNote: "The all clear first, then the report — a report filed while the zone is still held is written about an incident that hasn't ended.",
    },
  ],

  interrupts: [
    {
      id: "coworker-goes-back",
      kind: "Coworker heads back to the belt",
      after: "clear-area", delay: 2, seconds: 12,
      alert: "A coworker turns back toward the belt, saying they'll just carry the parcel out to the dock to get it out of the building.",
      cue: "Call them back — nobody handles it.",
      target: "callback-horn",
      why: "Carrying the parcel out means handling it and walking it past everyone between the belt and the door. Calling the coworker back, firmly and by name, is quicker than arguing about it and keeps the parcel exactly where the responders will expect to find it.",
      missNote: "The coworker picked the parcel up and carried it across the floor. It is now somewhere nobody is watching, and they are the person who handled it.",
      wrongNote: "Call them back on the horn — the plan's answer is to leave it, not to move it somewhere better.",
    },
    {
      id: "manager-restart",
      kind: "Pressure to restart the belt",
      after: "brief-responders", delay: 2, seconds: 12,
      alert: "A manager arrives and says the dispatch deadline means the belt has to restart now, zone or no zone.",
      cue: "The zone stays down until the all clear — point to the plan.",
      target: "plan-contact-phone",
      why: "A deadline has no bearing on whether the zone is safe. Pointing the manager to the plan contact and holding the zone until responders give the all clear is what the plan asks, and raising a safety concern like this is protected from retaliation.",
      missNote: "The belt restarted with the parcel still on it and responders not yet arrived. The zone that was cleared is now full of people again.",
      wrongNote: "Route it through the plan contact — the belt restarts on the all clear, not on the dispatch schedule.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, SPP_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#62676c", base2: "#5a5f64", seam: "rgba(0,0,0,0.18)" }), { repeat: 4, px: 256 });
    const floor = box(g, 7.4, 0.01, 6.8, 0, 0.002, 0, SPP_PAL.ground, { cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.05, color: 0x6a6f74 });

    const wallTex = surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const backWall = box(g, 7.4, 3.4, 0.12, 0, 1.7, -3.4, SPP_PAL.structure, { rough: 0.6 });
    backWall.material = texturedMat(wallTex, { rough: 0.6, metal: 0.3, color: 0xa3aab1 });
    const blockTex = surfaceTexture((cx, w, h) => blockFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const sideWall = box(g, 0.12, 3.4, 6.4, 3.7, 1.7, -0.2, 0x9aa1a8, { rough: 0.7 });
    sideWall.material = texturedMat(blockTex, { rough: 0.8, color: 0xb0b6bc });

    // ------------------------------------------------------------------ the culling belt
    const belts = [];
    for (let i = 0; i < 3; i++) belts.push(conveyorSection(g, -0.6, 0.0, -2.0 + i * 1.2, { colour: 0x4a5560 }));
    const beltTop = 0.52;
    const parcelColors = [0xc9a86b, 0xb8925a, 0xd9c58f, 0xa8844f];
    for (let i = 0; i < 4; i++) {
      const p = box(g, 0.3, 0.18, 0.26, -0.6, beltTop + 0.09, -2.4 + i * 0.55, parcelColors[i], { rough: 0.85 });
      p.rotation.y = i * 0.3;
    }
    const oddParcel = group(g, -0.6, beltTop, 0.8);
    box(oddParcel, 0.34, 0.2, 0.28, 0, 0.1, 0, 0xb8925a, { rough: 0.85 });
    for (const dz of [-0.06, 0.06]) box(oddParcel, 0.35, 0.205, 0.04, 0, 0.1, dz, 0xc8c2a0, { rough: 0.5 });
    box(oddParcel, 0.12, 0.005, 0.1, 0.06, 0.203, -0.02, 0x5a4a2a, { rough: 0.9, opacity: 0.7, transparent: true });
    holoTag(oddParcel, "Doesn't look right", 0, 0.4, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, oddParcel, "odd-parcel");
    const handsOff = box(g, 0.4, 0.3, 0.34, -0.6, beltTop + 0.12, 0.8, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, handsOff, "hands-off-marker");
    const stepBack = box(g, 0.6, 0.02, 0.6, 0.9, 0.003, 1.6, 0x59c97b, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, stepBack, "step-back-spot");

    // Belt control station.
    const ctrl = group(g, 0.2, 0, -0.4);
    box(ctrl, 0.3, 1.1, 0.22, 0, 0.55, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const selector = cyl(ctrl, 0.05, 0.05, 0.04, 0, 1.0, 0.12, 0xd8232a, { rough: 0.4, seg: 16 });
    selector.rotation.x = Math.PI / 2;
    box(ctrl, 0.08, 0.02, 0.02, 0, 1.0, 0.15, 0xf4f4f4, {});
    holoTag(ctrl, "Belt selector", 0, 1.24, 0, { css: SPP_ACCENT, w: 0.36 });
    reg(hits, selector, "belt-stop-selector");
    const beltLamp = cyl(ctrl, 0.035, 0.035, 0.04, 0, 0.86, 0.12, 0x59c97b, { emissive: 0x59c97b, ei: 1.0, seg: 12 });
    beltLamp.rotation.x = Math.PI / 2;

    // Culling table with decoys.
    const table = group(g, -1.9, 0, 0.2);
    box(table, 1.2, 0.05, 0.6, 0, 0.88, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.55, 0.55]) for (const sz of [-0.25, 0.25]) box(table, 0.05, 0.86, 0.05, sx, 0.43, sz, 0x4a5560, { metal: 0.5 });
    const cutter = box(table, 0.14, 0.02, 0.03, -0.3, 0.92, 0.1, 0xf2c14b, { rough: 0.5 });
    holoTag(cutter, "Box cutter", 0, 0.06, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, cutter, "open-to-check-decoy");
    const tote = group(table, 0.3, 0.9, 0);
    box(tote, 0.4, 0.2, 0.3, 0, 0.1, 0, 0x2f6fb0, { rough: 0.7 });
    decal(tote, 0.3, 0.08, 0, 0.1, 0.152, signFace("MOVE IT TO THE DOCK", { bg: "#fbe0df", accent: "#c9302b", fg: "#3a1010", scale: 0.4 }), { px: 180 });
    reg(hits, tote, "carry-outside-decoy");
    const deadlineCard = decal(table, 0.16, 0.1, 0.0, 0.915, -0.18,
      paperFace("", ["RESTART 0600", "REGARDLESS"], { bg: "#fbe0df", band: "#c9302b" }), { px: 150 });
    deadlineCard.rotation.x = -Math.PI / 2;
    reg(hits, deadlineCard, "resume-sort-decoy");

    // Fan decoy and the fan switch.
    const fan = group(g, -1.6, 0, -1.6, 0.9);
    cyl(fan, 0.18, 0.18, 0.03, 0, 0.015, 0, 0x2b3138, { seg: 14 });
    cyl(fan, 0.02, 0.02, 1.1, 0, 0.55, 0, 0x8b929a, { metal: 0.6, seg: 8 });
    const fanHead = cyl(fan, 0.24, 0.24, 0.1, 0, 1.2, 0, 0x4a5560, { seg: 18, open: true });
    fanHead.rotation.x = Math.PI / 2;
    const blades = box(fan, 0.4, 0.06, 0.01, 0, 1.2, 0, 0xc9ced3, {});
    holoTag(fan, "Blowing across belt", 0, 1.5, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, fan, "fan-on-decoy");
    const fanSwitch = group(g, 3.62, 1.3, -1.4, -Math.PI / 2);
    box(fanSwitch, 0.18, 0.26, 0.04, 0, 0, 0, 0xc9ced3, { rough: 0.5 });
    const fanToggle = box(fanSwitch, 0.04, 0.08, 0.04, 0, 0.03, 0.03, 0x59c97b, { rough: 0.4 });
    holoTag(fanSwitch, "Local fans", 0, 0.22, 0, { css: SPP_ACCENT, w: 0.3 });
    reg(hits, fanToggle, "fan-switch");

    // Exit route: blocked pallet, dark exit sign.
    const exitDoor = group(g, 3.6, 0, 1.8, -Math.PI / 2);
    box(exitDoor, 1.0, 2.2, 0.06, 0, 1.1, 0, 0x2f3338, { metal: 0.5 });
    box(exitDoor, 0.8, 0.04, 0.04, 0, 1.0, 0.05, 0xc9ced3, { metal: 0.6 });
    const exitSign = box(exitDoor, 0.4, 0.16, 0.05, 0, 2.4, 0.03, 0x2a3a2a, { emissive: 0x2a3a2a, ei: 0.05 });
    reg(hits, exitSign, "dark-exit-sign");
    const blockPallet = palletStack(g, 2.6, 0, 1.8, { ry: 0.2 });
    reg(hits, blockPallet, "blocked-exit");
    palletRackBay(g, -3.0, 0, -2.6, { ry: 0 });
    palletStack(g, 1.6, 0, -2.7, { ry: -0.3 });

    // Emergency plan board.
    const planBoard = holoPanel(g, 0.6, 0.42, 1.6, 1.7, -3.2, (ctx, w, h) => sppBoard(ctx, w, h, "EMERGENCY PLAN", ["Suspicious item: leave it, clear, report", "Tell the supervisor · call per plan", "Assembly point: north lot"]), { accent: SPP_ACCENT });
    reg(hits, planBoard, "emergency-plan-board");

    // Cordon stand and socket.
    const stand = group(g, 1.8, 0, 0.2);
    cyl(stand, 0.14, 0.16, 0.05, 0, 0.025, 0, 0xd8232a, { seg: 14 });
    cyl(stand, 0.025, 0.025, 0.95, 0, 0.5, 0, 0xc9ced3, { metal: 0.6, seg: 8 });
    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 2, px: 128 });
    const tape = box(stand, 1.0, 0.08, 0.01, 0.5, 0.92, 0, 0xf2c14b, {});
    tape.material = texturedMat(stripeTex, { rough: 0.6 });
    reg(hits, stand, "cordon-stand");
    const socket = box(g, 0.5, 0.02, 0.5, 0.6, 0.004, 2.2, 0xf2c14b, { opacity: 0.3, transparent: true, cast: false });
    hits["cordon-socket"] = socket;

    // Hand-wash station outside the zone.
    const wash = group(g, 2.9, 0, -0.6, -Math.PI / 2);
    box(wash, 0.6, 0.85, 0.45, 0, 0.43, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    box(wash, 0.44, 0.08, 0.3, 0, 0.84, 0.02, 0xb9c4c9, { metal: 0.6 });
    cyl(wash, 0.015, 0.015, 0.2, 0, 1.0, -0.12, 0xc9ced3, { metal: 0.8, seg: 8 });
    box(wash, 0.1, 0.18, 0.08, 0.2, 1.1, -0.18, 0xf4f8fa, {});
    holoTag(wash, "Hand wash", 0, 1.35, 0, { css: SPP_ACCENT, w: 0.3 });
    reg(hits, wash, "handwash-station");

    // Notify panel, roster, clipboard, all-clear board, report.
    const notifyPanel = holoPanel(g, 0.56, 0.36, 2.4, 1.6, 2.9, (ctx, w, h) => sppBoard(ctx, w, h, "NOTIFY", ["Supervisor · pending", "Call per plan · pending"]), { accent: SPP_ACCENT, ry: -2.6 });
    const markS = box(notifyPanel, 0.12, 0.08, 0.02, -0.12, -0.08, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, markS, "notify-supervisor");
    const markC = box(notifyPanel, 0.12, 0.08, 0.02, 0.12, -0.08, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, markC, "call-per-plan");
    const planPhone = group(g, 3.62, 1.2, 0.6, -Math.PI / 2);
    box(planPhone, 0.2, 0.28, 0.08, 0, 0, 0, 0x22272c, { rough: 0.5 });
    box(planPhone, 0.05, 0.22, 0.05, -0.12, 0, 0.05, 0x111418, {});
    holoTag(planPhone, "Plan contact", 0, 0.24, 0, { css: SPP_ACCENT, w: 0.34 });
    reg(hits, planPhone, "plan-contact-phone");

    const roster = instrument(g, -2.2, 1.0, 2.4, { idle: "-- / 14", color: SPP_ACCENT, w: 0.14, d: 0.2 });
    reg(hits, roster, "roster-panel");
    const clipboard = group(g, -1.6, 0, 2.6);
    box(clipboard, 0.5, 0.8, 0.4, 0, 0.4, 0, 0x4a5560, { metal: 0.4 });
    const clip = decal(clipboard, 0.22, 0.3, 0, 0.81, 0, paperFace("WITNESS NOTES", ["Where: culling belt 2", "What it looked like", "Who was near"], { bg: "#f4f6f8" }), { px: 180 });
    clip.rotation.x = -Math.PI / 2;
    reg(hits, clipboard, "witness-clipboard");
    const horn = cyl(g, 0.05, 0.1, 0.2, -2.6, 1.3, 1.6, 0xd8232a, { seg: 14 });
    horn.rotation.z = Math.PI / 2;
    holoTag(horn, "Call-back horn", 0, 0.18, 0, { css: SPP_ACCENT, w: 0.36 });
    reg(hits, horn, "callback-horn");
    const allClear = holoPanel(g, 0.56, 0.34, -3.0, 1.6, 1.0, (ctx, w, h) => sppBoard(ctx, w, h, "ZONE STATUS", ["HELD · awaiting all clear"], "#f0645b"), { accent: SPP_ACCENT, ry: 1.2 });
    reg(hits, allClear, "all-clear-board");
    const reportMark = box(allClear, 0.14, 0.08, 0.02, 0.15, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reportMark, "incident-report");
    const pace = box(g, 0.8, 0.02, 0.3, 1.8, 0.004, 1.2, 0x2f6fb0, { opacity: 0.3, transparent: true, cast: false });
    reg(hits, pace, "evac-pace");

    // Mail trays and hampers for depth.
    for (let i = 0; i < 4; i++) {
      const hamper = group(g, -3.0 + i * 0.55, 0, -0.9);
      box(hamper, 0.48, 0.7, 0.6, 0, 0.4, 0, 0x6b7f99, { rough: 0.8 });
      for (const sx of [-0.2, 0.2]) cyl(hamper, 0.03, 0.03, 0.04, sx, 0.03, 0.25, 0x111111, { seg: 8 });
    }
    for (let i = 0; i < 6; i++) box(g, 0.5, 0.12, 0.3, 1.0 + (i % 3) * 0.55, 0.06 + Math.floor(i / 3) * 0.12, -1.8, 0xf4f4f4, { rough: 0.7 });

    // Crew, clear of the controls.
    const coworker = standingFigure(g, 0.6, 0.9, { ry: 2.6, cloth: 0x2f4f7a, skin: 0xb98a63 });
    const handler = standingFigure(g, -2.2, 1.05, { ry: 1.2, cloth: 0x3a4a5a, skin: 0xe0b894 });
    void handler;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.6, 0.9, 0.4),

      onStepComplete(step) {
        if (step.id === "exit-scan") { blockPallet.visible = false; exitSign.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 }); }
        if (step.id === "stop-belt") { beltLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.2 }); selector.rotation.z = 0.8; }
        if (step.id === "cordon") { stand.position.set(0.6, 0, 2.2); stand.rotation.y = 0.2; }
        if (step.id === "air-per-plan") { fanToggle.material = mat(0x8b929a, { rough: 0.4 }); blades.rotation.z = 0; }
        if (step.id === "notify") repaint(notifyPanel.userData.face, (ctx, w, h) => sppBoard(ctx, w, h, "NOTIFY", ["Supervisor · told", "Call per plan · made"], "#59c97b"));
        if (step.id === "close-out") repaint(allClear.userData.face, (ctx, w, h) => sppBoard(ctx, w, h, "ZONE STATUS", ["ALL CLEAR · report filed"], "#59c97b"));
      },

      onInterrupt(it) {
        if (it.id === "coworker-goes-back") coworker.position.set(-0.2, 0, 0.9);
        if (it.id === "manager-restart") beltLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.3 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-goes-back") coworker.position.set(1.4, 0, 2.6);
        if (it.id === "manager-restart") beltLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.2 });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        if (!session?.done && fanToggle.material?.color?.getHex?.() !== 0x8b929a) blades.rotation.z = t * 8;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "assembly-count") {
          repaint(roster.userData.screen, signFace(`${Math.round(gg.t * 14)} / 14`, {
            bg: "#0d1c24", accent: gg.t >= 0.82 ? "#59c97b" : "#f0645b", fg: "#e3eefa", scale: 0.55,
          }));
        }
      },
    };
  },
};
